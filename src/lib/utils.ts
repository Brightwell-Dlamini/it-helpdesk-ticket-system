import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelative(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "critical": return "bg-red-500/15 text-red-400 border-red-500/30";
    case "high": return "bg-orange-500/15 text-orange-400 border-orange-500/30";
    case "medium": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "low": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    default: return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "open": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "in_progress": return "bg-violet-500/15 text-violet-400 border-violet-500/30";
    case "pending": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "resolved": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "closed": return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    default: return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

export function getStatusLabel(status: string): string {
  return status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
