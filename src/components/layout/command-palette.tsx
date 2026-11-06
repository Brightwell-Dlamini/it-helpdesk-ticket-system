"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Ticket,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  Monitor,
  Plus,
  ArrowRight,
  Hash,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

type CommandItem = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  icon: typeof Search;
  roles?: UserRole[];
  keywords?: string;
  group?: "nav" | "ticket";
};

type TicketHit = {
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  assigneeName: string | null;
};

const COMMANDS: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    hint: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    keywords: "home overview stats",
    group: "nav",
  },
  {
    id: "tickets",
    label: "Tickets",
    hint: "Queue",
    href: "/tickets",
    icon: Ticket,
    keywords: "issues incidents queue",
    group: "nav",
  },
  {
    id: "new-ticket",
    label: "New ticket",
    hint: "Create",
    href: "/tickets/new",
    icon: Plus,
    keywords: "create add request",
    group: "nav",
  },
  {
    id: "knowledge",
    label: "Knowledge Base",
    hint: "Articles",
    href: "/knowledge",
    icon: BookOpen,
    keywords: "docs help articles kb",
    group: "nav",
  },
  {
    id: "knowledge-new",
    label: "New article",
    hint: "Publish",
    href: "/knowledge/new",
    icon: BookOpen,
    roles: ["admin", "agent"],
    keywords: "write publish kb",
    group: "nav",
  },
  {
    id: "reports",
    label: "Reports",
    hint: "Analytics",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "agent"],
    keywords: "metrics sla export",
    group: "nav",
  },
  {
    id: "users",
    label: "Users",
    hint: "Roles",
    href: "/users",
    icon: Users,
    roles: ["admin"],
    keywords: "team roles access",
    group: "nav",
  },
  {
    id: "settings",
    label: "Settings",
    hint: "Config",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "agent"],
    keywords: "sla config organisation",
    group: "nav",
  },
  {
    id: "wall",
    label: "Wall Display",
    hint: "Ops board",
    href: "/wall",
    icon: Monitor,
    roles: ["admin", "agent"],
    keywords: "monitor live ops",
    group: "nav",
  },
];

function priorityDot(priority: string) {
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

export function CommandPalette({ role }: { role: UserRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [ticketHits, setTicketHits] = useState<TicketHit[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = useMemo(() => {
    const visible = COMMANDS.filter(
      (c) => !c.roles || c.roles.includes(role)
    );
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((c) => {
      const hay = `${c.label} ${c.hint ?? ""} ${c.keywords ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, role]);

  // Debounced ticket search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (!open || q.length < 2) {
      setTicketHits([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/tickets/search?q=${encodeURIComponent(q)}`
        );
        if (!res.ok) throw new Error("search failed");
        const data = (await res.json()) as { tickets: TicketHit[] };
        setTicketHits(data.tickets ?? []);
      } catch {
        setTicketHits([]);
      } finally {
        setSearching(false);
      }
    }, 180);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  const items = useMemo(() => {
    const ticketCommands: CommandItem[] = ticketHits.map((t) => ({
      id: `ticket-${t.id}`,
      label: t.title,
      hint: t.number,
      href: `/tickets/${t.id}`,
      icon: Hash,
      group: "ticket" as const,
      keywords: `${t.number} ${t.status} ${t.priority}`,
    }));
    return [...ticketCommands, ...navItems];
  }, [ticketHits, navItems]);

  useEffect(() => {
    setActive(0);
  }, [query, open, items.length]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    setTicketHits([]);
  }, []);

  const run = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && items[active]) {
        e.preventDefault();
        run(items[active].href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, close, run]);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("apexdesk:open-command", onOpen);
    return () => window.removeEventListener("apexdesk:open-command", onOpen);
  }, []);

  if (!open) return null;

  const hasTickets = ticketHits.length > 0;
  const hasNav = navItems.length > 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh] sm:pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        aria-label="Close command palette"
        onClick={close}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl animate-scale-in">
        <div className="flex items-center gap-3 border-b border-slate-800 px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tickets, pages, commands…"
            className="h-12 w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {searching ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-500" />
          ) : (
            <kbd className="hidden rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline">
              ESC
            </kbd>
          )}
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {items.length === 0 && !searching ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm text-slate-500">No matches</p>
              <p className="mt-1 text-xs text-slate-600">
                Try a ticket number, title, or page name
              </p>
            </div>
          ) : (
            <>
              {hasTickets && (
                <div className="mb-1 px-2 pt-1">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    Tickets
                  </p>
                  <ul>
                    {ticketHits.map((t, index) => {
                      const globalIndex = index;
                      const isActive = globalIndex === active;
                      return (
                        <li key={t.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(globalIndex)}
                            onClick={() => run(`/tickets/${t.id}`)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                              isActive
                                ? "bg-emerald-600/15 text-emerald-100"
                                : "text-slate-300 hover:bg-slate-900"
                            )}
                          >
                            <div
                              className={cn(
                                "h-2 w-2 shrink-0 rounded-full",
                                priorityDot(t.priority)
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium tabular-nums text-slate-500">
                                  {t.number}
                                </span>
                                <span className="truncate font-medium">
                                  {t.title}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[11px] capitalize text-slate-500">
                                {t.status.replace("_", " ")}
                                {t.assigneeName
                                  ? ` · ${t.assigneeName}`
                                  : " · Unassigned"}
                              </p>
                            </div>
                            <ArrowRight
                              className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                isActive ? "text-emerald-500" : "text-slate-700"
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {hasNav && (
                <div className={cn(hasTickets && "mt-2 border-t border-slate-800/80 pt-2")}>
                  {hasTickets && (
                    <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      Pages
                    </p>
                  )}
                  <ul>
                    {navItems.map((item, index) => {
                      const globalIndex = ticketHits.length + index;
                      const isActive = globalIndex === active;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(globalIndex)}
                            onClick={() => run(item.href)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                              isActive
                                ? "bg-emerald-600/15 text-emerald-100"
                                : "text-slate-300 hover:bg-slate-900"
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                isActive ? "text-emerald-400" : "text-slate-500"
                              )}
                            />
                            <span className="flex-1 font-medium">{item.label}</span>
                            {item.hint && (
                              <span className="text-xs text-slate-500">
                                {item.hint}
                              </span>
                            )}
                            <ArrowRight
                              className={cn(
                                "h-3.5 w-3.5",
                                isActive ? "text-emerald-500" : "text-slate-700"
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2 text-[11px] text-slate-600">
          <span>↑↓ navigate · ↵ open</span>
          <span className="hidden sm:inline">⌘K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
}

export function openCommandPalette() {
  window.dispatchEvent(new Event("apexdesk:open-command"));
}
