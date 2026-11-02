import type { TicketPriority } from "@/types";

export interface SlaPolicy {
  priority: TicketPriority;
  responseHours: number;
  resolutionHours: number;
}

export const DEFAULT_SLA_POLICIES: SlaPolicy[] = [
  { priority: "critical", responseHours: 1, resolutionHours: 4 },
  { priority: "high", responseHours: 2, resolutionHours: 8 },
  { priority: "medium", responseHours: 4, resolutionHours: 24 },
  { priority: "low", responseHours: 8, resolutionHours: 48 },
];

export function getSlaPolicy(priority: TicketPriority): SlaPolicy {
  return (
    DEFAULT_SLA_POLICIES.find((p) => p.priority === priority) ??
    DEFAULT_SLA_POLICIES[2]
  );
}

export function calculateDueAt(
  createdAt: Date | string,
  priority: TicketPriority
): Date {
  const policy = getSlaPolicy(priority);
  const created = new Date(createdAt);
  return new Date(created.getTime() + policy.resolutionHours * 60 * 60 * 1000);
}

export function isSlaBreached(
  createdAt: Date | string,
  priority: TicketPriority,
  resolvedAt?: Date | string | null,
  status?: string
): boolean {
  if (status === "resolved" || status === "closed") {
    if (!resolvedAt) return false;
    const due = calculateDueAt(createdAt, priority);
    return new Date(resolvedAt) > due;
  }
  const due = calculateDueAt(createdAt, priority);
  return new Date() > due;
}

export function hoursUntilBreach(
  createdAt: Date | string,
  priority: TicketPriority
): number {
  const due = calculateDueAt(createdAt, priority);
  const diffMs = due.getTime() - Date.now();
  return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
}
