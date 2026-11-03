"use client";

import { Badge } from "@/components/ui/badge";
import {
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  formatRelative,
} from "@/lib/utils";
import Link from "next/link";
import { Filter, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Ticket, TicketStatus } from "@/types";
import { useTicketsRealtime } from "@/hooks/use-tickets-realtime";

const STATUS_FILTERS: { label: string; value: TicketStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
];

export function TicketsBoard({ tickets }: { tickets: Ticket[] }) {
  useTicketsRealtime(true);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return tickets.filter((ticket) => {
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
      if (priorityFilter !== "all" && ticket.priority !== priorityFilter)
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
  }, [tickets, statusFilter, priorityFilter, search]);

  return (
    <div className="p-6">
      <div className="mb-5 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by number, title, requester, tag..."
            className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Status
          </span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-emerald-600/20 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}

          <span className="mx-1 h-4 w-px bg-slate-800" />

          <span className="text-xs text-slate-500">Priority</span>
          {["all", "critical", "high", "medium", "low"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
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

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Ticket</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Requester</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Assignee</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  No tickets match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((ticket) => (
                <tr key={ticket.id} className="bg-slate-950/40 transition-colors hover:bg-slate-900/60">
                  <td className="px-4 py-3">
                    <Link href={`/tickets/${ticket.id}`} className="block hover:text-emerald-400">
                      <span className="text-xs font-medium text-slate-500">{ticket.number}</span>
                      <p className="mt-0.5 max-w-xs truncate font-medium">{ticket.title}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(ticket.status)}>{getStatusLabel(ticket.status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                  </td>
                  <td className="hidden px-4 py-3 capitalize text-slate-400 md:table-cell">{ticket.category}</td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">{ticket.requesterName}</td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                    {ticket.assigneeName || <span className="text-amber-400/80">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatRelative(ticket.updatedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
