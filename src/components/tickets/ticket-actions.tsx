"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  assignToMe,
  updateTicketStatus,
  updateTicketPriority,
  addComment,
} from "@/app/actions/tickets";
import type { TicketStatus, TicketPriority, UserRole } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

interface TicketActionsProps {
  ticketId: string;
  currentStatus: TicketStatus;
  currentPriority?: TicketPriority;
  isAssigned: boolean;
  role: UserRole;
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

export function TicketActions({
  ticketId,
  currentStatus,
  currentPriority = "medium",
  isAssigned,
  role,
}: TicketActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  const canManage = role === "admin" || role === "agent";

  if (!canManage) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
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

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
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

      <div className="relative">
        <Button
          className="w-full"
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => {
            setShowStatusMenu((v) => !v);
            setShowPriorityMenu(false);
          }}
        >
          Change Status
        </Button>
        {showStatusMenu && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl">
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
                  setShowStatusMenu(false);
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
          }}
        >
          Change Priority
        </Button>
        {showPriorityMenu && (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl">
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
                  setShowPriorityMenu(false);
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
        <p className="text-xs text-center text-emerald-400/90 pt-1">{message}</p>
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
    <form onSubmit={handleSubmit} className="border-t border-slate-800 p-5">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a reply or note..."
        rows={3}
        disabled={isPending}
        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none disabled:opacity-60"
      />
      <div className="mt-3 flex items-center justify-between">
        {canInternal ? (
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded"
            />
            Internal note (not visible to requester)
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
