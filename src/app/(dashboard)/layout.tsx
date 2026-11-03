import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser } from "@/lib/data";
import { currentUser as mockUser } from "@/lib/mock-data";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = (await getCurrentUser()) ?? mockUser;

  return (
    <div className="min-h-screen">
      <Sidebar user={user} />
      <main className="pl-64">{children}</main>
    </div>
  );
}
