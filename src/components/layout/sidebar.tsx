"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  Monitor,
  LifeBuoy,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, UserRole } from "@/types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: ["admin", "agent"],
  },
  {
    href: "/users",
    label: "Users",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin", "agent"],
  },
  {
    href: "/wall",
    label: "Wall Display",
    icon: Monitor,
    roles: ["admin", "agent"],
  },
];

export function Sidebar({
  user,
  mobileOpen = false,
  onMobileClose,
}: {
  user: User;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();

  const visible = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-full w-[min(18rem,85vw)] flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-transform duration-200 ease-out lg:z-40 lg:w-64 lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-800/80 px-4 lg:h-16 lg:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-900/40">
            <LifeBuoy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">ApexDesk</p>
            <p className="text-[11px] text-slate-500">IT Service Desk</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-900 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Workspace
        </p>
        {visible.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-emerald-600/12 text-emerald-400"
                  : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-emerald-400" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800/80 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-semibold text-emerald-400 ring-1 ring-slate-700">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-[11px] capitalize text-slate-500">
              {user.role}
            </p>
          </div>
        </div>
        <Link
          href="/login"
          onClick={onMobileClose}
          className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-900 hover:text-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
