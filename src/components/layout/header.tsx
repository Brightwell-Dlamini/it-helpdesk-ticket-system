"use client";

import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ReactNode } from "react";
import { openCommandPalette } from "@/components/layout/command-palette";

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
          <button
            type="button"
            onClick={() => openCommandPalette()}
            className="hidden h-9 items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 text-sm text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-300 md:inline-flex lg:min-w-[14rem]"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="rounded border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => openCommandPalette()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100 md:hidden"
            aria-label="Open search"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-colors hover:border-slate-800 hover:bg-slate-900 hover:text-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
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
