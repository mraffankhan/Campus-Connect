import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { AdminClubTable } from "@/components/admin/admin-club-table";
import { Building2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminClubsPage() {
  await requireRole("SUPER_ADMIN");

  const clubs = await prisma.club.findMany({
    include: {
      _count: {
        select: {
          memberships: { where: { status: "APPROVED" } },
          events: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="h-3.5 w-3.5" />
            <span>Super Admin</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manage Campus Clubs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review student club creation applications, approve active chapters, or suspend inactive clubs.
          </p>
        </div>
      </div>

      <AdminClubTable clubs={clubs as any} />
    </div>
  );
}
