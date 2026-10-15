import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { UserCog } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const currentAdmin = await requireRole("SUPER_ADMIN");

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          memberships: { where: { status: "APPROVED" } },
          registrations: { where: { status: "CONFIRMED" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCog className="h-3.5 w-3.5" />
            <span>User Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Campus Directory Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View all enrolled students, manage administrative privileges, and assign coordinator roles
          </p>
        </div>
      </div>

      <AdminUserTable
        users={users as any}
        currentAdminId={currentAdmin.id}
      />
    </div>
  );
}
