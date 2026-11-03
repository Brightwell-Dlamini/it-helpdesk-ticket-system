import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/data";
import { currentUser as mockUser } from "@/lib/mock-data";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = (await getCurrentUser()) ?? mockUser;

  return <AppShell user={user}>{children}</AppShell>;
}
