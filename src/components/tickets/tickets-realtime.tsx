"use client";

import { useTicketsRealtime } from "@/hooks/use-tickets-realtime";

export function TicketsRealtime() {
  useTicketsRealtime(true);
  return null;
}
