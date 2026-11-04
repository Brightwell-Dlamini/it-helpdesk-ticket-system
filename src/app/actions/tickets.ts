"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateDueAt, isSlaBreached } from "@/lib/sla";
import type { TicketPriority, TicketStatus, TicketCategory } from "@/types";

export type ActionResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

async function insertSystemComment(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ticketId: string,
  authorId: string,
  content: string
) {
  await supabase.from("comments").insert({
    ticket_id: ticketId,
    author_id: authorId,
    content,
    is_internal: false,
  });
}

export async function createTicket(formData: {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: {
        id: "mock-" + Date.now(),
        number: "HD-" + Math.floor(1000 + Math.random() * 9000),
        ...formData,
      },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const dueAt = calculateDueAt(new Date(), formData.priority);

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      requester_id: user.id,
      due_at: dueAt.toISOString(),
      status: "open",
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  await insertSystemComment(
    supabase,
    data.id,
    user.id,
    `Ticket created · Priority ${formData.priority} · Category ${formData.category}`
  );

  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return { success: true, data };
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: { id: ticketId, status } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("tickets")
    .select("status, created_at, priority")
    .eq("id", ticketId)
    .single();

  if (!existing) return { success: false, error: "Ticket not found" };
  if (existing.status === status) {
    return { success: true, data: { id: ticketId, status } };
  }

  const updates: Record<string, unknown> = { status };
  if (status === "resolved" || status === "closed") {
    updates.resolved_at = new Date().toISOString();
  }

  if (status === "resolved" || status === "closed") {
    updates.sla_breached = isSlaBreached(
      existing.created_at,
      existing.priority,
      new Date().toISOString(),
      status
    );
  }

  const { error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", ticketId);
  if (error) return { success: false, error: error.message };

  await insertSystemComment(
    supabase,
    ticketId,
    user.id,
    `Status changed to ${STATUS_LABELS[status]}`
  );

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: { id: ticketId, priority } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("tickets")
    .select("priority, created_at, status, resolved_at")
    .eq("id", ticketId)
    .single();

  if (!existing) return { success: false, error: "Ticket not found" };
  if (existing.priority === priority) {
    return { success: true, data: { id: ticketId, priority } };
  }

  const dueAt = calculateDueAt(existing.created_at, priority);
  const updates: Record<string, unknown> = {
    priority,
    due_at: dueAt.toISOString(),
  };

  // Re-evaluate SLA when priority changes on open tickets
  if (!["resolved", "closed"].includes(existing.status)) {
    updates.sla_breached = isSlaBreached(
      existing.created_at,
      priority,
      null,
      existing.status
    );
  }

  const { error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", ticketId);
  if (error) return { success: false, error: error.message };

  await insertSystemComment(
    supabase,
    ticketId,
    user.id,
    `Priority changed to ${priority}`
  );

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignTicket(
  ticketId: string,
  assigneeId: string | null
): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: { id: ticketId, assigneeId } };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const updates: Record<string, unknown> = { assignee_id: assigneeId };
  let assigneeName = "Unassigned";

  if (assigneeId) {
    updates.status = "in_progress";
    const { data: ticket } = await supabase
      .from("tickets")
      .select("first_response_at")
      .eq("id", ticketId)
      .single();
    if (ticket && !ticket.first_response_at) {
      updates.first_response_at = new Date().toISOString();
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", assigneeId)
      .single();
    assigneeName = profile?.full_name ?? "agent";
  }

  const { error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", ticketId);
  if (error) return { success: false, error: error.message };

  await insertSystemComment(
    supabase,
    ticketId,
    user.id,
    assigneeId ? `Assigned to ${assigneeName}` : "Assignment cleared"
  );

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function assignToMe(ticketId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: { id: ticketId, assignedTo: "current-user" } };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  return assignTicket(ticketId, user.id);
}

export async function addComment(formData: {
  ticketId: string;
  content: string;
  isInternal?: boolean;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return {
      success: true,
      data: { id: "mock-comment-" + Date.now(), ...formData },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("comments").insert({
    ticket_id: formData.ticketId,
    author_id: user.id,
    content: formData.content,
    is_internal: formData.isInternal ?? false,
  });
  if (error) return { success: false, error: error.message };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const ticketUpdates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (profile && (profile.role === "agent" || profile.role === "admin")) {
    const { data: ticket } = await supabase
      .from("tickets")
      .select("first_response_at")
      .eq("id", formData.ticketId)
      .single();
    if (ticket && !ticket.first_response_at) {
      ticketUpdates.first_response_at = new Date().toISOString();
    }
  }

  await supabase
    .from("tickets")
    .update(ticketUpdates)
    .eq("id", formData.ticketId);
  revalidatePath(`/tickets/${formData.ticketId}`);
  return { success: true };
}

export async function runSlaBreachDetection(): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { success: true, data: { breachedCount: 0 } };
  }

  const supabase = await createClient();
  const { data: openTickets, error } = await supabase
    .from("tickets")
    .select("id, created_at, priority, status, sla_breached")
    .in("status", ["open", "in_progress", "pending"])
    .eq("sla_breached", false);

  if (error) return { success: false, error: error.message };

  let breachedCount = 0;
  for (const ticket of openTickets ?? []) {
    if (
      isSlaBreached(ticket.created_at, ticket.priority, null, ticket.status)
    ) {
      await supabase
        .from("tickets")
        .update({ sla_breached: true })
        .eq("id", ticket.id);

      // Best-effort system note (uses first available agent/admin as author if possible)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await insertSystemComment(
          supabase,
          ticket.id,
          user.id,
          "SLA resolution window breached"
        );
      }

      breachedCount++;
    }
  }

  revalidatePath("/tickets");
  revalidatePath("/dashboard");
  return { success: true, data: { breachedCount } };
}
