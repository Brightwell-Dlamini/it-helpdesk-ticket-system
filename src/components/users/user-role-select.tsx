"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/app/actions/users";
import type { UserRole } from "@/types";
import { useToast } from "@/components/ui/toast";

const ROLES: UserRole[] = ["admin", "agent", "requester"];

export function UserRoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const role = e.target.value as UserRole;
    if (role === currentRole) return;

    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (result.success) {
        toast(`Role updated to ${role}`, "success");
        router.refresh();
      } else {
        toast(result.error ?? "Failed to update role", "error");
        e.target.value = currentRole;
      }
    });
  }

  return (
    <select
      defaultValue={currentRole}
      disabled={disabled || isPending}
      onChange={onChange}
      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs capitalize text-slate-200 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-50"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
