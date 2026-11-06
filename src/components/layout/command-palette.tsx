"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
};

const COMMANDS: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    hint: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    keywords: "home overview stats",
  },
  {
    id: "tickets",
    label: "Tickets",
    hint: "Queue",
    href: "/tickets",
    icon: Ticket,
    keywords: "issues incidents queue",
  },
  {
    id: "new-ticket",
    label: "New ticket",
    hint: "Create",
    href: "/tickets/new",
    icon: Plus,
    keywords: "create add request",
  },
  {
    id: "knowledge",
    label: "Knowledge Base",
    hint: "Articles",
    href: "/knowledge",
    icon: BookOpen,
    keywords: "docs help articles kb",
  },
  {
    id: "knowledge-new",
    label: "New article",
    hint: "Publish",
    href: "/knowledge/new",
    icon: BookOpen,
    roles: ["admin", "agent"],
    keywords: "write publish kb",
  },
  {
    id: "reports",
    label: "Reports",
    hint: "Analytics",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "agent"],
    keywords: "metrics sla export",
  },
  {
    id: "users",
    label: "Users",
    hint: "Roles",
    href: "/users",
    icon: Users,
    roles: ["admin"],
    keywords: "team roles access",
  },
  {
    id: "settings",
    label: "Settings",
    hint: "Config",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "agent"],
    keywords: "sla config organisation",
  },
  {
    id: "wall",
    label: "Wall Display",
    hint: "Ops board",
    href: "/wall",
    icon: Monitor,
    roles: ["admin", "agent"],
    keywords: "monitor live ops",
  },
];

export function CommandPalette({ role }: { role: UserRole }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo(() => {
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

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
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

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh] sm:pt-[15vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        aria-label="Close command palette"
        onClick={close}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl animate-scale-in">
        <div className="flex items-center gap-3 border-b border-slate-800 px-4">
          <Search className="h-4 w-4 shrink-0 text-slate-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages…"
            className="h-12 w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="hidden rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline">
            ESC
          </kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-slate-500">
              No matches
            </li>
          ) : (
            items.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => run(item.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                    index === active
                      ? "bg-emerald-600/15 text-emerald-100"
                      : "text-slate-300 hover:bg-slate-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      index === active ? "text-emerald-400" : "text-slate-500"
                    )}
                  />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.hint && (
                    <span className="text-xs text-slate-500">{item.hint}</span>
                  )}
                  <ArrowRight
                    className={cn(
                      "h-3.5 w-3.5",
                      index === active ? "text-emerald-500" : "text-slate-700"
                    )}
                  />
                </button>
              </li>
            ))
          )}
        </ul>
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
