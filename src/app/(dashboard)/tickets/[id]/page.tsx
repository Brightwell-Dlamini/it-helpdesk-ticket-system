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
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TicketActions, CommentForm } from "@/components/tickets/ticket-actions";
import { TicketAttachments } from "@/components/tickets/ticket-attachments";

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
            <div className="card overflow-hidden">
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

            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-800/80 px-5 py-4">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <h2 className="font-semibold">Activity</h2>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-400">
                  {sorted.length}
                </span>
              </div>

              <div className="divide-y divide-slate-800/70">
                {sorted.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className="text-sm text-slate-500">
                      No activity yet. Be the first to respond.
                    </p>
                  </div>
                ) : (
                  sorted.map((comment) => {
                    const isSystem =
                      comment.isSystem || comment.authorName === "System";

                    if (isSystem) {
                      return (
                        <div
                          key={comment.id}
                          className="flex items-start gap-3 bg-slate-950/30 px-5 py-3"
                        >
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900">
                            <Activity className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-slate-500">
                              <span className="font-medium text-slate-400">System</span>
                              <span className="mx-1.5 text-slate-700">·</span>
                              {formatRelative(comment.createdAt)}
                            </p>
                            <p className="mt-0.5 text-sm text-slate-400">{comment.content}</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={comment.id} className="px-5 py-4">
                        <div className="mb-2 flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-semibold text-emerald-400 ring-1 ring-slate-700">
                            {comment.authorName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-100">
                              {comment.authorName}
                              <span className="ml-2 text-xs font-normal capitalize text-slate-500">
                                {comment.authorRole}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatRelative(comment.createdAt)}
                            </p>
                          </div>
                          {comment.isInternal && (
                            <Badge className="border-amber-500/30 bg-amber-500/15 text-[10px] text-amber-400">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <p className="pl-11 text-sm leading-relaxed text-slate-300">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <CommentForm ticketId={ticket.id} role={role} />
            </div>
          </div>

          <div className="space-y-4">
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
                  <dd className="font-medium text-slate-100">{ticket.requesterName}</dd>
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
                  <dd className="font-medium text-slate-200">{formatDate(ticket.createdAt)}</dd>
                </div>
                <div>
                  <dt className="mb-1 flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    Last Updated
                  </dt>
                  <dd className="font-medium text-slate-200">{formatDate(ticket.updatedAt)}</dd>
                </div>
                {ticket.dueAt && (
                  <div>
                    <dt className="mb-1 flex items-center gap-1.5 text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      Due
                    </dt>
                    <dd
                      className={`font-medium ${
                        ticket.slaBreached ? "text-red-400" : "text-slate-200"
                      }`}
                    >
                      {formatDate(ticket.dueAt)}
                    </dd>
                  </div>
                )}
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
