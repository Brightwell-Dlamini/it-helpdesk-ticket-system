"use client";

import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ReactNode } from "react";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showNewTicket?: boolean;
}

export function Header({
  title,
  description,
  actions,
  showNewTicket = true,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex min-h-14 flex-col gap-3 px-4 py-3 sm:min-h-16 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-0">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-50 sm:text-lg">
            {title}
          </h1>
          {description && (
            <p className="truncate text-xs text-slate-500 sm:text-sm">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search tickets, knowledge..."
              className="h-9 w-52 rounded-lg border border-slate-800 bg-slate-900/80 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 transition-colors focus:border-emerald-600 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 lg:w-64"
            />
          </div>

          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-colors hover:border-slate-800 hover:bg-slate-900 hover:text-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
          </button>

          {actions}
          {!actions && showNewTicket && (
            <Link href="/tickets/new">
              <Button size="sm" className="min-h-9 shadow-md shadow-emerald-900/20">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Ticket</span>
                <span className="sm:hidden">New</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
