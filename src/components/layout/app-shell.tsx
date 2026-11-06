"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import type { User } from "@/types";
import { Menu, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { ToastProvider } from "@/components/ui/toast";
import { CommandPalette } from "@/components/layout/command-palette";

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="mesh-bg min-h-screen">
        <div className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-4 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-lg shadow-emerald-900/40">
              <LifeBuoy className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">ApexDesk</span>
          </Link>
          <div className="w-10" />
        </div>

        {mobileOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fade-in lg:hidden"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <Sidebar
          user={user}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        <main className="lg:pl-64">
          <div className="mx-auto w-full max-w-[1600px] animate-fade-in">
            {children}
          </div>
        </main>

        <CommandPalette role={user.role} />
      </div>
    </ToastProvider>
  );
}
