"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  assignToMe,
  assignTicket,
  updateTicketStatus,
  updateTicketPriority,
  addComment,
} from "@/app/actions/tickets";
import type { TicketStatus, TicketPriority, UserRole } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface AgentOption {
  id: string;
  name: string;
}

interface TicketActionsProps {
  ticketId: string;
  currentStatus: TicketStatus;
  currentPriority?: TicketPriority;
  isAssigned: boolean;
  currentAssigneeId?: string;
  role: UserRole;
  agents?: AgentOption[];
}

const STATUS_OPTIONS: { label: string; value: TicketStatus }[] = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

const PRIORITY_OPTIONS: { label: string; value: TicketPriority }[] = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const CANNED_REPLIES = [
  {
    label: "Acknowledged",
    text: "Thanks for reporting this. We've received your request and are looking into it.",
  },
  {
    label: "Need more info",
    text: "Could you please provide a bit more detail so we can investigate further? Screenshots or exact error messages would help.",
  },
  {
    label: "Resolved — confirm",
    text: "We've applied a fix on our side. Please try again and let us know if the issue is resolved.",
  },
  {
    label: "Pending vendor",
    text: "This is currently with our vendor/provider. We'll update you as soon as we have progress.",
  },
];

export function TicketActions({
  ticketId,
  currentStatus,
  currentPriority = "medium",
  isAssigned,
  currentAssigneeId,
  role,
  agents = [],
}: TicketActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);

  const canManage = role === "admin" || role === "agent";

  if (!canManage) {
    return (
      <div className="card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Actions
        </h3>
        <p className="mt-2 text-xs text-slate-500">
          Status and assignment are managed by the support team.
        </p>
      </div>
    );
  }

  function runAction(
    action: () => Promise<{ success: boolean; error?: string }>,
    successMsg: string
  ) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        setMessage(successMsg);
        toast(successMsg, "success");
        router.refresh();
      } else {
        const err = result.error ?? "Action failed";
        setMessage(err);
        toast(err, "error");
      }
    });
  }

  function closeMenus() {
    setShowStatusMenu(false);
    setShowPriorityMenu(false);
    setShowAssignMenu(false);
  }

  return (
    <div className="card space-y-3 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Actions
      </h3>

      {!isAssigned && (
        <Button
          className="w-full"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() =>
            runAction(() => assignToMe(ticketId), "Assigned to you")
          }
        >
          Assign to me
        </Button>
      )}

      {agents.length > 0 && (
        <div className="relative">
          <Button
            className="w-full"
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => {
              setShowAssignMenu((v) => !v);
              setShowStatusMenu(false);
              setShowPriorityMenu(false);
            }}
          >
            Assign to…
          </Button>
          {showAssignMenu && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl shadow-black/40">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  disabled={agent.id === currentAssigneeId || isPending}
                  className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                    agent.id === currentAssigneeId
                      ? "bg-emerald-600/20 text-emerald-400"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                  onClick={() => {
                    closeMenus();
                    runAction(
                      () => assignTicket(ticketId, agent.id),
                      `Assigned to ${agent.name}`
                    );
                  }}
                >
                  {agent.name}
                </button>
              ))}
              {isAssigned && (
                <button
                  type="button"
                  disabled={isPending}
                  className="block w-full border-t border-slate-800 px-3 py-2 text-left text-sm text-amber-400/90 hover:bg-slate-800"
                  onClick={() => {
                    closeMenus();
                    runAction(
                      () => assignTicket(ticketId, null),
                      "Assignment cleared"
                    );
                  }}
                >
                  Clear assignment
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="relative">
        <Button
          className="w-full"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => {
            setShowStatusMenu((v) => !v);
            setShowPriorityMenu(false);
            setShowAssignMenu(false);
          }}
        >
          Change Status
        </Button>
        {showStatusMenu && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl shadow-black/40">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.value === currentStatus || isPending}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                  opt.value === currentStatus
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                onClick={() => {
                  closeMenus();
                  runAction(
                    () => updateTicketStatus(ticketId, opt.value),
                    `Status → ${opt.label}`
                  );
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <Button
          className="w-full"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => {
            setShowPriorityMenu((v) => !v);
            setShowStatusMenu(false);
            setShowAssignMenu(false);
          }}
        >
          Change Priority
        </Button>
        {showPriorityMenu && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl shadow-black/40">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.value === currentPriority || isPending}
                className={`block w-full px-3 py-2 text-left text-sm capitalize transition-colors ${
                  opt.value === currentPriority
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
                onClick={() => {
                  closeMenus();
                  runAction(
                    () => updateTicketPriority(ticketId, opt.value),
                    `Priority → ${opt.label}`
                  );
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {currentStatus !== "resolved" && currentStatus !== "closed" && (
        <Button
          className="w-full"
          size="sm"
          disabled={isPending}
          onClick={() =>
            runAction(
              () => updateTicketStatus(ticketId, "resolved"),
              "Marked as resolved"
            )
          }
        >
          Mark Resolved
        </Button>
      )}

      {message && (
        <p className="pt-1 text-center text-xs text-emerald-400/90">{message}</p>
      )}
    </div>
  );
}

interface CommentFormProps {
  ticketId: string;
  role: UserRole;
}

export function CommentForm({ ticketId, role }: CommentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canInternal = role === "admin" || role === "agent";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await addComment({
        ticketId,
        content: content.trim(),
        isInternal: canInternal ? isInternal : false,
      });

      if (result.success) {
        setContent("");
        setIsInternal(false);
        toast("Reply posted", "success");
        router.refresh();
      } else {
        const err = result.error ?? "Failed to post comment";
        setError(err);
        toast(err, "error");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-800/80 p-5"
    >
      {canInternal && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {CANNED_REPLIES.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setContent(c.text)}
              className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-400 transition-colors hover:border-emerald-600/50 hover:text-emerald-400"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a reply or note..."
        rows={3}
        disabled={isPending}
        className="w-full resize-none rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-2.5 text-sm placeholder:text-slate-500 transition-colors focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-60"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        {canInternal ? (
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-slate-600"
            />
            Internal note
          </label>
        ) : (
          <span />
        )}
        <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
          {isPending ? "Posting..." : "Post Reply"}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </form>
  );
}
