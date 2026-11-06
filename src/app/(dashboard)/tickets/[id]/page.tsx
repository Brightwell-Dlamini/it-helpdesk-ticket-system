import { Header } from "@/components/layout/header";
import {
  getTicketById,
  getComments,
  getUsers,
  getCurrentUser,
  getAttachments,
} from "@/lib/data";
import { currentUser as mockUser } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import {
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  formatDate,
  formatRelative,
} from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  User,
  Tag,
  MessageSquare,
  AlertCircle,
  Activity,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TicketActions, CommentForm } from "@/components/tickets/ticket-actions";
import { TicketAttachments } from "@/components/tickets/ticket-attachments";
import { calculateDueAt, getSlaPolicy, hoursUntilBreach } from "@/lib/sla";

interface PageProps {
  params: Promise<{ id: string }>;
}

function priorityBar(priority: string) {
  switch (priority) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-amber-500";
    default:
      return "bg-emerald-500";
  }
}

function SlaCard({
  createdAt,
  priority,
  resolvedAt,
  status,
  slaBreached,
  dueAt,
}: {
  createdAt: string;
  priority: "low" | "medium" | "high" | "critical";
  resolvedAt?: string;
  status: string;
  slaBreached?: boolean;
  dueAt?: string;
}) {
  const policy = getSlaPolicy(priority);
  const due = dueAt ? new Date(dueAt) : calculateDueAt(createdAt, priority);
  const isClosed = status === "resolved" || status === "closed";
  const hoursLeft = isClosed ? 0 : hoursUntilBreach(createdAt, priority);
  const totalHours = policy.resolutionHours;
  const elapsed = Math.min(
    totalHours,
    Math.max(0, totalHours - hoursLeft)
  );
  const pct = isClosed
    ? 100
    : Math.min(100, Math.max(0, Math.round((elapsed / totalHours) * 100)));

  const atRisk = !isClosed && !slaBreached && hoursLeft <= 2 && hoursLeft > 0;

  let barColor = "bg-emerald-500";
  let label = `${hoursLeft}h remaining`;
  let labelColor = "text-emerald-400";

  if (isClosed) {
    barColor = slaBreached ? "bg-red-500" : "bg-emerald-500";
    label = slaBreached ? "Resolved after breach" : "Resolved on time";
    labelColor = slaBreached ? "text-red-400" : "text-emerald-400";
  } else if (slaBreached) {
    barColor = "bg-red-500";
    label = "SLA breached";
    labelColor = "text-red-400";
  } else if (atRisk) {
    barColor = "bg-amber-500";
    label = `${hoursLeft}h left · at risk`;
    labelColor = "text-amber-400";
  }

  return (
    <div className="card overflow-hidden p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          SLA
        </h3>
        <Timer className="h-3.5 w-3.5 text-slate-500" />
      </div>

      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className={`font-medium ${labelColor}`}>{label}</span>
          <span className="tabular-nums text-slate-500">{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <dl className="space-y-2 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Target</dt>
          <dd className="font-medium tabular-nums text-slate-300">
            {policy.resolutionHours}h resolution
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Response</dt>
          <dd className="font-medium tabular-nums text-slate-300">
            {policy.responseHours}h first response
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500">Due</dt>
          <dd
            className={`font-medium tabular-nums ${
              slaBreached ? "text-red-400" : "text-slate-300"
            }`}
          >
            {formatDate(due.toISOString())}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [ticket, ticketComments, users, me, attachments] = await Promise.all([
    getTicketById(id),
    getComments(id),
    getUsers(),
    getCurrentUser(),
    getAttachments(id),
  ]);

  if (!ticket) {
    notFound();
  }

  const role = (me ?? mockUser).role;
  const assignee = users.find((u) => u.id === ticket.assigneeId);
  const agents = users.filter(
    (u) => u.role === "agent" || u.role === "admin"
  );

  const visibleComments =
    role === "requester"
      ? ticketComments.filter((c) => !c.isInternal)
      : ticketComments;

  const sorted = [...visibleComments].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div>
      <Header title={ticket.number} description={ticket.title} />

      <div className="p-4 sm:p-6">
        <div className="mb-5">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tickets
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="card animate-fade-up overflow-hidden">
              <div className="flex">
                <div className={`w-1 shrink-0 ${priorityBar(ticket.priority)}`} />
                <div className="min-w-0 flex-1 p-5 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className="border-slate-500/30 bg-slate-500/15 capitalize text-slate-400">
                      {ticket.category}
                    </Badge>
                    {ticket.slaBreached && (
                      <Badge className="border-red-500/30 bg-red-500/15 text-red-400">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        SLA Breached
                      </Badge>
                    )}
                  </div>

                  <h1 className="mb-3 text-xl font-semibold tracking-tight text-slate-50">
                    {ticket.title}
                  </h1>

                  <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
                    {ticket.description}
                  </p>

                  {ticket.tags && ticket.tags.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-slate-500" />
                      {ticket.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-slate-800 bg-slate-950/60 px-2 py-0.5 text-xs text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card animate-fade-up overflow-hidden" style={{ animationDelay: "0.06s" }}>
              <div className="flex items-center gap-2 border-b border-slate-800/80 px-5 py-4">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <h2 className="font-semibold">Activity</h2>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-400">
                  {sorted.length}
                </span>
              </div>

              {sorted.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/60">
                    <MessageSquare className="h-5 w-5 text-slate-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-400">
                    No activity yet
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Be the first to respond.
                  </p>
                </div>
              ) : (
                <div className="relative px-5 py-4">
                  {/* Vertical timeline rail */}
                  <div className="absolute bottom-6 left-[2.15rem] top-6 w-px bg-gradient-to-b from-slate-700 via-slate-800 to-transparent" />

                  <ul className="space-y-0">
                    {sorted.map((comment, idx) => {
                      const isSystem =
                        comment.isSystem || comment.authorName === "System";
                      const isLast = idx === sorted.length - 1;

                      if (isSystem) {
                        return (
                          <li
                            key={comment.id}
                            className={`relative flex gap-4 ${isLast ? "" : "pb-5"}`}
                          >
                            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 shadow-sm">
                              <Activity className="h-3.5 w-3.5 text-slate-500" />
                            </div>
                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="text-xs text-slate-500">
                                <span className="font-medium text-slate-400">
                                  System
                                </span>
                                <span className="mx-1.5 text-slate-700">·</span>
                                {formatRelative(comment.createdAt)}
                              </p>
                              <p className="mt-0.5 text-sm text-slate-400">
                                {comment.content}
                              </p>
                            </div>
                          </li>
                        );
                      }

                      return (
                        <li
                          key={comment.id}
                          className={`relative flex gap-4 ${isLast ? "" : "pb-5"}`}
                        >
                          <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-semibold text-emerald-400 ring-1 ring-slate-700 shadow-sm">
                            {comment.authorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-slate-100">
                                {comment.authorName}
                              </p>
                              <span className="text-xs capitalize text-slate-500">
                                {comment.authorRole}
                              </span>
                              {comment.isInternal && (
                                <Badge className="border-amber-500/30 bg-amber-500/15 text-[10px] text-amber-400">
                                  Internal
                                </Badge>
                              )}
                              <span className="text-xs text-slate-600">
                                {formatRelative(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-300">
                              {comment.content}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <CommentForm ticketId={ticket.id} role={role} />
            </div>
          </div>

          <div className="space-y-4">
            <SlaCard
              createdAt={ticket.createdAt}
              priority={ticket.priority}
              resolvedAt={ticket.resolvedAt}
              status={ticket.status}
              slaBreached={ticket.slaBreached}
              dueAt={ticket.dueAt}
            />

            <div className="card p-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Details
              </h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-slate-500">
                    <User className="h-3.5 w-3.5" />
                    Requester
                  </dt>
                  <dd className="font-medium text-slate-100">
                    {ticket.requesterName}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-slate-500">
                    <User className="h-3.5 w-3.5" />
                    Assignee
                  </dt>
                  <dd className="font-medium">
                    {assignee ? (
                      <span className="text-slate-100">{assignee.name}</span>
                    ) : (
                      <span className="text-amber-400/90">Unassigned</span>
                    )}
                  </dd>
                </div>
                <div className="h-px bg-slate-800/80" />
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Created
                  </dt>
                  <dd className="font-medium text-slate-200">
                    {formatDate(ticket.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Last Updated
                  </dt>
                  <dd className="font-medium text-slate-200">
                    {formatDate(ticket.updatedAt)}
                  </dd>
                </div>
                {ticket.firstResponseAt && (
                  <div>
                    <dt className="mb-1 text-slate-500">First Response</dt>
                    <dd className="font-medium text-slate-200">
                      {formatDate(ticket.firstResponseAt)}
                    </dd>
                  </div>
                )}
                {ticket.resolvedAt && (
                  <div>
                    <dt className="mb-1 text-slate-500">Resolved</dt>
                    <dd className="font-medium text-emerald-400">
                      {formatDate(ticket.resolvedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <TicketAttachments
              ticketId={ticket.id}
              attachments={attachments}
              canUpload={true}
            />

            <TicketActions
              ticketId={ticket.id}
              currentStatus={ticket.status}
              currentPriority={ticket.priority}
              isAssigned={Boolean(ticket.assigneeId)}
              currentAssigneeId={ticket.assigneeId}
              role={role}
              agents={agents.map((a) => ({ id: a.id, name: a.name }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
