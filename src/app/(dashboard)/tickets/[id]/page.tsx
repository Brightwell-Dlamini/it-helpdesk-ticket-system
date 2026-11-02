import { Header } from "@/components/layout/header";
import { tickets, comments, users } from "@/lib/mock-data";
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
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TicketActions, CommentForm } from "@/components/tickets/ticket-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    notFound();
  }

  const ticketComments = comments.filter((c) => c.ticketId === ticket.id);
  const assignee = users.find((u) => u.id === ticket.assigneeId);

  return (
    <div>
      <Header title={ticket.number} description={ticket.title} />

      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tickets
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <Badge className={getStatusColor(ticket.status)}>
                  {getStatusLabel(ticket.status)}
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30 capitalize">
                  {ticket.category}
                </Badge>
                {ticket.slaBreached && (
                  <Badge className="bg-red-500/15 text-red-400 border-red-500/30">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    SLA Breached
                  </Badge>
                )}
              </div>

              <h1 className="text-xl font-semibold tracking-tight mb-3">
                {ticket.title}
              </h1>

              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </p>

              {ticket.tags && ticket.tags.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-slate-500" />
                  {ticket.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <h2 className="font-semibold">
                  Activity ({ticketComments.length})
                </h2>
              </div>

              <div className="divide-y divide-slate-800">
                {ticketComments.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-slate-500">
                    No comments yet. Be the first to respond.
                  </div>
                ) : (
                  ticketComments.map((comment) => (
                    <div key={comment.id} className="px-5 py-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-emerald-400">
                          {comment.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
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
                          <Badge className="ml-auto bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
                            Internal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed pl-11">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <CommentForm ticketId={ticket.id} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                Details
              </h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500 mb-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Requester
                  </dt>
                  <dd className="font-medium">{ticket.requesterName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Assignee
                  </dt>
                  <dd className="font-medium">
                    {assignee ? (
                      assignee.name
                    ) : (
                      <span className="text-amber-400/80">Unassigned</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Created
                  </dt>
                  <dd className="font-medium">{formatDate(ticket.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-1 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Last Updated
                  </dt>
                  <dd className="font-medium">{formatDate(ticket.updatedAt)}</dd>
                </div>
                {ticket.dueAt && (
                  <div>
                    <dt className="text-slate-500 mb-1 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Due
                    </dt>
                    <dd className="font-medium">{formatDate(ticket.dueAt)}</dd>
                  </div>
                )}
                {ticket.resolvedAt && (
                  <div>
                    <dt className="text-slate-500 mb-1">Resolved</dt>
                    <dd className="font-medium text-emerald-400">
                      {formatDate(ticket.resolvedAt)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <TicketActions
              ticketId={ticket.id}
              currentStatus={ticket.status}
              isAssigned={Boolean(ticket.assigneeId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
