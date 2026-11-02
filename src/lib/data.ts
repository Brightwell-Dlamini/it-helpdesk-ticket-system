import { createClient } from "@/lib/supabase/server";
import {
  tickets as mockTickets,
  comments as mockComments,
  users as mockUsers,
  knowledgeArticles as mockArticles,
  dashboardStats as mockStats,
  currentUser as mockCurrentUser,
} from "@/lib/mock-data";
import type { Ticket, Comment, User, KnowledgeArticle, DashboardStats } from "@/types";
import { isSlaBreached } from "@/lib/sla";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapTicket(row: Record<string, unknown>, profiles?: Map<string, { full_name: string }>): Ticket {
  const requesterId = row.requester_id as string;
  const assigneeId = row.assignee_id as string | null;

  return {
    id: row.id as string,
    number: row.number as string,
    title: row.title as string,
    description: row.description as string,
    status: row.status as Ticket["status"],
    priority: row.priority as Ticket["priority"],
    category: row.category as Ticket["category"],
    requesterId,
    requesterName: profiles?.get(requesterId)?.full_name ?? "Unknown",
    assigneeId: assigneeId ?? undefined,
    assigneeName: assigneeId ? profiles?.get(assigneeId)?.full_name : undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    resolvedAt: (row.resolved_at as string) ?? undefined,
    dueAt: (row.due_at as string) ?? undefined,
    slaBreached:
      (row.sla_breached as boolean) ||
      isSlaBreached(
        row.created_at as string,
        row.priority as Ticket["priority"],
        row.resolved_at as string | null,
        row.status as string
      ),
    tags: (row.tags as string[]) ?? [],
  };
}

export async function getTickets(): Promise<Ticket[]> {
  if (!isSupabaseConfigured()) return mockTickets;

  try {
    const supabase = await createClient();
    const { data: tickets, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !tickets) return mockTickets;

    const ids = new Set<string>();
    tickets.forEach((t) => {
      ids.add(t.requester_id);
      if (t.assignee_id) ids.add(t.assignee_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", Array.from(ids));

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, { full_name: p.full_name }])
    );

    return tickets.map((t) => mapTicket(t, profileMap));
  } catch {
    return mockTickets;
  }
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  if (!isSupabaseConfigured()) {
    return mockTickets.find((t) => t.id === id) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    const ids = [data.requester_id];
    if (data.assignee_id) ids.push(data.assignee_id);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, { full_name: p.full_name }])
    );

    return mapTicket(data, profileMap);
  } catch {
    return mockTickets.find((t) => t.id === id) ?? null;
  }
}

export async function getComments(ticketId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) {
    return mockComments.filter((c) => c.ticketId === ticketId);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles:author_id(full_name, role)")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return data.map((c) => ({
      id: c.id,
      ticketId: c.ticket_id,
      authorId: c.author_id,
      authorName: (c.profiles as { full_name: string })?.full_name ?? "Unknown",
      authorRole: (c.profiles as { role: string })?.role as Comment["authorRole"],
      content: c.content,
      isInternal: c.is_internal,
      createdAt: c.created_at,
    }));
  } catch {
    return mockComments.filter((c) => c.ticketId === ticketId);
  }
}

export async function getUsers(): Promise<User[]> {
  if (!isSupabaseConfigured()) return mockUsers;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (error || !data) return mockUsers;

    return data.map((p) => ({
      id: p.id,
      name: p.full_name,
      email: p.email,
      role: p.role,
      department: p.department ?? undefined,
      avatarUrl: p.avatar_url ?? undefined,
      createdAt: p.created_at,
    }));
  } catch {
    return mockUsers;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return mockCurrentUser;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) return null;

    return {
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      role: profile.role,
      department: profile.department ?? undefined,
      avatarUrl: profile.avatar_url ?? undefined,
      createdAt: profile.created_at,
    };
  } catch {
    return mockCurrentUser;
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) return mockStats;

  try {
    const tickets = await getTickets();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const pending = tickets.filter((t) => t.status === "pending").length;
    const resolvedToday = tickets.filter(
      (t) => t.resolvedAt && new Date(t.resolvedAt) >= today
    ).length;
    const unassigned = tickets.filter(
      (t) => !t.assigneeId && !["resolved", "closed"].includes(t.status)
    ).length;
    const critical = tickets.filter(
      (t) => t.priority === "critical" && !["resolved", "closed"].includes(t.status)
    ).length;

    const totalWithSla = tickets.filter((t) => t.resolvedAt || t.slaBreached).length;
    const breached = tickets.filter((t) => t.slaBreached).length;
    const slaCompliance =
      totalWithSla > 0
        ? Math.round(((totalWithSla - breached) / totalWithSla) * 1000) / 10
        : 100;

    return {
      openTickets: open,
      inProgress,
      pending,
      resolvedToday,
      slaCompliance,
      avgResponseTimeHours: mockStats.avgResponseTimeHours,
      unassigned,
      critical,
    };
  } catch {
    return mockStats;
  }
}

export async function getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  return mockArticles;
}
