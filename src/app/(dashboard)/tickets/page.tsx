import { Header } from "@/components/layout/header";
import { tickets } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import {
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
  formatRelative,
} from "@/lib/utils";
import Link from "next/link";
import { Filter } from "lucide-react";

export default function TicketsPage() {
  return (
    <div>
      <Header
        title="Tickets"
        description={`${tickets.length} tickets in the system`}
      />

      <div className="p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
          {["All", "Open", "In Progress", "Pending", "Resolved"].map((f) => (
            <button
              key={f}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                f === "All"
                  ? "bg-emerald-600/20 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Category
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Requester
                </th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">
                  Assignee
                </th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="bg-slate-950/40 transition-colors hover:bg-slate-900/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="block hover:text-emerald-400"
                    >
                      <span className="text-xs font-medium text-slate-500">
                        {ticket.number}
                      </span>
                      <p className="mt-0.5 max-w-xs truncate font-medium">
                        {ticket.title}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(ticket.status)}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 capitalize text-slate-400 md:table-cell">
                    {ticket.category}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                    {ticket.requesterName}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                    {ticket.assigneeName || (
                      <span className="text-amber-400/80">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatRelative(ticket.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
