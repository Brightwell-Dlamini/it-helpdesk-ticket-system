"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  formatRelative,
} from "@/lib/utils";
import Link from "next/link";
import { Filter, Search, X, Bookmark, CheckSquare } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import type { Ticket, TicketStatus, UserRole } from "@/types";
import { useTicketsRealtime } from "@/hooks/use-tickets-realtime";
import { assignToMe, updateTicketStatus } from "@/app/actions/tickets";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

const STATUS_FILTERS: { label: string; value: TicketStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
];

type QuickFilter = "all" | "mine" | "unassigned" | "critical";

type SavedView = {
  id: string;
  name: string;
  quickFilter: QuickFilter;
  statusFilter: TicketStatus | "all";
  priorityFilter: string;
};

const DEFAULT_AGENT_VIEWS: SavedView[] = [
  { id: "my-open", name: "My open", quickFilter: "mine", statusFilter: "open", priorityFilter: "all" },
  { id: "unassigned", name: "Unassigned", quickFilter: "unassigned", statusFilter: "all", priorityFilter: "all" },
  { id: "critical", name: "Critical", quickFilter: "critical", statusFilter: "all", priorityFilter: "all" },
];

const VIEWS_KEY = "apexdesk.ticketViews";

export function TicketsBoard({
  tickets,
  currentUserId = "u1",
  currentUserRole = "admin",
}: {
  tickets: Ticket[];
  currentUserId?: string;
  currentUserRole?: UserRole;
}) {
  useTicketsRealtime(true);
  const router = useRouter();
  const { toast } = useToast();
  const isRequester = currentUserRole === "requester";
  const canBulk = currentUserRole === "admin" || currentUserRole === "agent";

  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(isRequester ? "mine" : "all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedViews, setSavedViews] = useState<SavedView[]>(DEFAULT_AGENT_VIEWS);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VIEWS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SavedView[];
        if (Array.isArray(parsed) && parsed.length) setSavedViews(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const filtered = useMemo(() => {
    return tickets.filter((ticket) => {
      if (isRequester && ticket.requesterId !== currentUserId) return false;
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
      if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
      if (quickFilter === "mine" && !isRequester && ticket.assigneeId !== currentUserId) return false;
      if (quickFilter === "unassigned" && ticket.assigneeId) return false;
      if (quickFilter === "critical" && ticket.priority !== "critical") return false;
      if (
        (quickFilter === "unassigned" || quickFilter === "critical") &&
        ["resolved", "closed"].includes(ticket.status)
      )
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          ticket.number,
          ticket.title,
          ticket.description,
          ticket.requesterName,
          ticket.assigneeName ?? "",
          ticket.category,
          ...(ticket.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, quickFilter, search, isRequester, currentUserId]);

  function applyView(view: SavedView) {
    setActiveViewId(view.id);
    setQuickFilter(view.quickFilter);
    setStatusFilter(view.statusFilter);
    setPriorityFilter(view.priorityFilter);
  }

  function saveCurrentView() {
    const name = window.prompt("Name this view");
    if (!name?.trim()) return;
    const view: SavedView = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      quickFilter,
      statusFilter,
      priorityFilter,
    };
    const next = [...savedViews, view];
    setSavedViews(next);
    setActiveViewId(view.id);
    try {
      localStorage.setItem(VIEWS_KEY, JSON.stringify(next));
      toast(`Saved view "${view.name}"`, "success");
    } catch {
      toast("Could not save view", "error");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((t) => t.id)));
  }

  function runBulk(
    label: string,
    action: (id: string) => Promise<{ success: boolean; error?: string }>
  ) {
    const ids = Array.from(selected);
    if (!ids.length) return;
    startTransition(async () => {
      let ok = 0;
      let fail = 0;
      for (const id of ids) {
        const result = await action(id);
        if (result.success) ok++;
        else fail++;
      }
      setSelected(new Set());
      router.refresh();
      if (fail === 0) toast(`${label}: ${ok} ticket(s)`, "success");
      else toast(`${label}: ${ok} ok, ${fail} failed`, "error");
    });
  }

  const quickOptions: { value: QuickFilter; label: string }[] = isRequester
    ? [
        { value: "mine", label: "My tickets" },
        { value: "all", label: "All mine" },
      ]
    : [
        { value: "all", label: "All active" },
        { value: "mine", label: "Assigned to me" },
        { value: "unassigned", label: "Unassigned" },
        { value: "critical", label: "Critical" },
      ];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 space-y-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="h-11 w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 sm:h-10"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isRequester && (
          <div className="flex flex-wrap items-center gap-2">
            <Bookmark className="h-3.5 w-3.5 text-slate-500" />
            {savedViews.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => applyView(view)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeViewId === view.id
                    ? "bg-violet-600 text-white"
                    : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {view.name}
              </button>
            ))}
            <button
              type="button"
              onClick={saveCurrentView}
              className="rounded-full border border-dashed border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:border-emerald-600 hover:text-emerald-400"
            >
              + Save view
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {quickOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setQuickFilter(opt.value);
                setActiveViewId(null);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                quickFilter === opt.value
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="hidden shrink-0 items-center gap-1.5 text-xs text-slate-500 sm:inline-flex">
              <Filter className="h-3.5 w-3.5" />
              Status
            </span>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => {
                  setStatusFilter(f.value);
                  setActiveViewId(null);
                }}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:py-1.5 ${
                  statusFilter === f.value
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="hidden shrink-0 text-xs text-slate-500 sm:inline">Priority</span>
            {["all", "critical", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPriorityFilter(p);
                  setActiveViewId(null);
                }}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors sm:py-1.5 ${
                  priorityFilter === p
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {canBulk && selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
            <CheckSquare className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-300">{selected.size} selected</span>
            <Button size="sm" variant="secondary" disabled={isPending} onClick={() => runBulk("Assigned to me", (id) => assignToMe(id))}>
              Assign to me
            </Button>
            <Button size="sm" variant="secondary" disabled={isPending} onClick={() => runBulk("Marked in progress", (id) => updateTicketStatus(id, "in_progress"