import { Header } from "@/components/layout/header";
import { getUsers, getCurrentUser } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { UserRoleSelect } from "@/components/users/user-role-select";
import { currentUser as mockUser } from "@/lib/mock-data";

const roleColors: Record<string, string> = {
  admin: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  agent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  requester: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export default async function UsersPage() {
  const [users, me] = await Promise.all([getUsers(), getCurrentUser()]);
  const role = (me ?? mockUser).role;
  const isAdmin = role === "admin";

  return (
    <div>
      <Header
        title="Users & Roles"
        description={
          isAdmin
            ? "Manage team members and access levels"
            : "Team directory"
        }
      />
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="bg-slate-950/40 transition-colors hover:bg-slate-900/60"
                >
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-slate-400">{user.email}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <div className="flex items-center gap-2">
                        <Badge className={roleColors[user.role]}>
                          {user.role}
                        </Badge>
                        <UserRoleSelect
                          userId={user.id}
                          currentRole={user.role}
                          disabled={user.id === me?.id}
                        />
                      </div>
                    ) : (
                      <Badge className={roleColors[user.role]}>{user.role}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {user.department || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isAdmin && (
          <p className="mt-3 text-xs text-slate-500">
            Admins can change roles. You cannot demote your own account.
          </p>
        )}
      </div>
    </div>
  );
}
