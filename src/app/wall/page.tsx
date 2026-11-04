"use client";

import { useCallback, useEffect, useState } from "react";
import { LifeBuoy } from "lucide-react";
import type { Ticket, TicketPriority, TicketStatus } from "@/types";

type WallTicket = Ticket & {
  hoursLeft: number;
  atRisk: boolean;
};

type WallStats = {
  open: number;
  inProgress: number;
  pending: number;
  critical: number;
  high: number;
  unassigned: number;
  breached: number;
  atRisk: number;
  total: number;
  slaCompliance: number;
};

function formatAge(createdAt: string): string {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatSla(hoursLeft: number, breached?: boolean): string {
  if (breached || hoursLeft < 0) return "BREACHED";
  if (hoursLeft < 1) return `${Math.max(0, Math.round(hoursLeft * 60))}m`;
  if (hoursLeft < 24) return `${hoursLeft.toFixed(1)}h`;
  return `${Math.round(hoursLeft / 24)}d`;
}

function priorityBar(priority: TicketPriority): string {
  switch (priority) {
    case "critical":
      return "bg-red-500";
    case "high":
      return "bg-orange-500";
    case "medium":
      return "bg-amber-500";
    case "low":
      return "bg-emerald-600";
    default:
      return "bg-slate-600";
  }
}

function statusLabel(status: TicketStatus): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function WallPage() {
  const [tickets, setTickets] = useState<WallTicket[]>([]);
  const [stats, setStats] = useState<WallStats | null>(null);
  const [clock, setClock] = useState("");
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [live, setLive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/wall", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load wall data");
      const data = await res.json();
      setTickets(data.tickets ?? []);
      setStats(data.stats ?? null);
      setLastSync(new Date());
      setError(null);
      setLive(true);
    } catch {
      setError("Connection issue — retrying…");
      setLive(false);
    }
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 15_000);
    return () => clearInterval(poll);
  }, [load]);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }
    let channel: { unsubscribe: () => void } | null = null;
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const ch = supabase
          .channel("wall-tickets")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "tickets" },
            () => load()
          )
          .subscribe();
        channel = { unsubscribe: () => supabase.removeChannel(ch) };
      } catch {
        // polling still runs
      }
    })();
    return () => channel?.unsubscribe();
  }, [load]);

  const maxRows = 18;
  const visible = tickets.slice(0, maxRows);
  const overflow = Math.max(0, tickets.length - maxRows);

  return (
    <div className="flex h-screen flex-col px-5 py-4 lg:px-8 lg:py-5">
      <header className="mb-4 flex items-center justify-between gap-4 border-b border-slate-800/50 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-xl shadow-emerald-900/50 ring-1 ring-emerald-400/30">
            <LifeBuoy className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white lg:text-2xl">
              ApexDesk
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Live Operations Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 rounded-full border border-slate-800/80 bg-slate-900/50 px-3 py-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                live
                  ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]"
                  : "bg-red-500"
              }`}
              style={live ? { animation: "live-dot 1.6s ease-in-out infinite" } : undefined}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {live ? "Live" : "Reconnecting"}
            </span>
          </div>
          <div className="text-right">
            <p className="font-mono text-xl font-bold tabular-nums tracking-tight text-white lg:text-3xl">
              {clock}
            </p>
            {lastSync && (
              <p className="text-[10px] uppercase tracking-wider text-slate-600">
                Synced {lastSync.toLocaleTimeString("en-GB", { hour12: false })}
              </p>
            )}
          </div>
        </div>
      </header>

      {stats && (
        <div className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-4 lg:grid-cols-8 lg:gap-3">
          <Metric label="Active" value={stats.total} accent="text-white" ring="ring-slate-700/80" />
          <Metric label="Open" value={stats.open} accent="text-blue-400" ring="ring-blue-500/25" />
          <Metric label="In Progress" value={stats.inProgress} accent="text-violet-400" ring="ring-violet-500/25" />
          <Metric label="Pending" value={stats.pending} accent="text-amber-400" ring="ring-amber-500/25" />
          <Metric label="Critical" value={stats.critical} accent="text-red-400" ring="ring-red-500/35" pulse={stats.critical > 0} />
          <Metric label="Unassigned" value={stats.unassigned} accent="text-orange-400" ring="ring-orange-500/30" />
          <Metric label="SLA Risk" value={stats.atRisk} accent="text-amber-300" ring="ring-amber-500/35" pulse={stats.atRisk > 0} />
          <Metric label="Breached" value={stats.breached} accent="text-red-500" ring="ring-red-500/45" pulse={stats.breached > 0} />
        </div>
      )}

      <div className="mb-1.5 grid grid-cols-[minmax(0,1fr)_100px_110px_100px_90px_100px] gap-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 lg:grid-cols-[minmax(0,1.4fr)_120px_130px_110px_100px_110px] lg:text-[11px]">
        <span>Ticket</span>
        <span>Priority</span>
        <span>Status</span>
        <span>Age</span>
        <span>SLA</span>
        <span className="text-right">Assignee</span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-hidden">
        {visible.length === 0 && !error && (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <p className="text-3xl font-bold tracking-tight text-emerald-400/90">
              Queue clear
            </p>
            <p className="mt-2 text-sm text-slate-500">No active tickets right now</p>
          </div>
        )}

        {visible.map((ticket, i) => {
          const breached = Boolean(ticket.slaBreached) || ticket.hoursLeft < 0;
          const critical = ticket.priority === "critical";
          const atRisk = ticket.atRisk && !breached;

          return (
            <div
              key={ticket.id}
              className={[
                "grid grid-cols-[minmax(0,1fr)_100px_110px_100px_90px_100px] items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors lg:grid-cols-[minmax(0,1.4fr)_120px_130px_110px_100px_110px] lg:py-3",
                breached
                  ? "border-red-500/50 bg-red-950/45 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.12),0_0_24px_-8px_rgba(239,68,68,0.35)]"
                  : critical
                    ? "border-red-500/30 bg-red-950/25"
                    : atRisk
                      ? "border-amber-500/30 bg-amber-950/20"
                      : "border-slate-800/60 bg-slate-900/35",
              ].join(" ")}
              style={{ animation: "fade-up 0.4s cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${i * 18}ms` }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`h-11 w-1 shrink-0 rounded-full ${priorityBar(ticket.priority)} ${
                    critical || breached ? "shadow-[0_0_10px_currentColor]" : ""
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-slate-500 lg:text-sm">
                      {ticket.number}
                    </span>
                    {breached && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-red-500 text-white shadow-lg shadow-red-900/40">
                        Breach
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-slate-50 lg:text-base">
                    {ticket.title}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 lg:text-xs">
                    {ticket.requesterName}
                    <span className="mx-1.5 text-slate-700">·</span>
                    <span className="capitalize">{ticket.category}</span>
                  </p>
                </div>
              </div>

              <div>
                <span
                  className={[
                    "inline-block rounded-md px-2 py-1 text-[11px] font-extrabold uppercase tracking-wide lg:text-xs",
                    ticket.priority === "critical"
                      ? "bg-red-500 text-white shadow-md shadow-red-900/40"
                      : ticket.priority === "high"
                        ? "bg-orange-500/90 text-white"
                        : ticket.priority === "medium"
                          ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25",
                  ].join(" ")}
                >
                  {ticket.priority}
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-300 lg:text-sm">
                  {statusLabel(ticket.status)}
                </span>
              </div>

              <div className="font-mono text-sm tabular-nums text-slate-400 lg:text-base">
                {formatAge(ticket.createdAt)}
              </div>

              <div
                className={[
                  "font-mono text-sm font-bold tabular-nums lg:text-base",
                  breached
                    ? "text-red-400"
                    : atRisk
                      ? "text-amber-300"
                      : "text-slate-400",
                ].join(" ")}
              >
                {formatSla(ticket.hoursLeft, ticket.slaBreached)}
              </div>

              <div className="text-right text-xs text-slate-400 lg:text-sm">
                {ticket.assigneeName ? (
                  <span className="font-semibold text-slate-200">
                    {ticket.assigneeName.split(" ")[0]}
                  </span>
                ) : (
                  <span className="font-bold text-orange-400">—</span>
                )}
              </div>
            </div>
          );
        })}

        {overflow > 0 && (
          <p className="pt-2 text-center text-xs text-slate-600">
            +{overflow} more active ticket{overflow === 1 ? "" : "s"} not shown
          </p>
        )}
      </div>

      <footer className="mt-3 flex items-center justify-between border-t border-slate-800/50 pt-3 text-[10px] uppercase tracking-[0.15em] text-slate-600 lg:text-xs">
        <span>
          Sorted by severity · SLA risk · age
          {error && (
            <span className="ml-3 normal-case tracking-normal text-amber-500/80">
              {error}
            </span>
          )}
        </span>
        <span className="text-slate-500">
          ApexDesk Wall · Ops only · Not for public display
        </span>
      </footer>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
  ring,
  pulse,
}: {
  label: string;
  value: number;
  accent: string;
  ring: string;
  pulse?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-slate-900/55 px-3 py-2.5 ring-1 backdrop-blur-sm ${ring} ${
        pulse && value > 0 ? "animate-pulse" : ""
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 lg:text-[11px]">
        {label}
      </p>
      <p
        className={`mt-0.5 text-2xl font-extrabold tabular-nums tracking-tight lg:text-3xl ${accent}`}
      >
        {value}
      </p>
    </div>
  );
}
