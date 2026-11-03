import { NextResponse } from "next/server";
import { getTickets, getDashboardStats } from "@/lib/data";
import { calculateDueAt, hoursUntilBreach } from "@/lib/sla";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function priorityRank(p: string): number {
  switch (p) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4;
  }
}

export async function GET() {
  const [allTickets, stats] = await Promise.all([
    getTickets(),
    getDashboardStats(),
  ]);

  const active = allTickets.filter((t) =>
    ["open", "in_progress", "pending"].includes(t.status)
  );

  const enriched = active.map((t) => {
    const due =
      t.dueAt ?? calculateDueAt(t.createdAt, t.priority).toISOString();
    const hoursLeft = hoursUntilBreach(t.createdAt, t.priority);
    const atRisk = hoursLeft <= 2 && hoursLeft > 0 && !t.slaBreached;
    return {
      ...t,
      dueAt: due,
      hoursLeft,
      atRisk,
    };
  });

  enriched.sort((a, b) => {
    if (a.slaBreached !== b.slaBreached) return a.slaBreached ? -1 : 1;
    const pr = priorityRank(a.priority) - priorityRank(b.priority);
    if (pr !== 0) return pr;
    if (a.atRisk !== b.atRisk) return a.atRisk ? -1 : 1;
    return a.hoursLeft - b.hoursLeft;
  });

  const wallStats = {
    open: active.filter((t) => t.status === "open").length,
    inProgress: active.filter((t) => t.status === "in_progress").length,
    pending: active.filter((t) => t.status === "pending").length,
    critical: active.filter((t) => t.priority === "critical").length,
    high: active.filter((t) => t.priority === "high").length,
    unassigned: active.filter((t) => !t.assigneeId).length,
    breached: active.filter((t) => t.slaBreached).length,
    atRisk: enriched.filter((t) => t.atRisk && !t.slaBreached).length,
    total: active.length,
    slaCompliance: stats.slaCompliance,
  };

  return NextResponse.json({
    tickets: enriched,
    stats: wallStats,
    generatedAt: new Date().toISOString(),
  });
}
