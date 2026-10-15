import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { Megaphone, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  await requireRole("SUPER_ADMIN");

  const collegeWideAnnouncements = await prisma.announcement.findMany({
    where: { clubId: null },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      club: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
          <Megaphone className="h-3.5 w-3.5" />
          <span>Super Admin</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">College-Wide Announcements</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Broadcast emergency bulletins, registration updates, and campus-wide news to all students.
        </p>
      </div>

      {/* Broadcast Form */}
      <AnnouncementForm isSuperAdmin />

      {/* Existing College-wide Broadcasts */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <h2 className="text-xl font-bold">Past College Broadcasts ({collegeWideAnnouncements.length})</h2>
        {collegeWideAnnouncements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No college-wide announcements broadcasted yet.</p>
        ) : (
          <div className="space-y-4">
            {collegeWideAnnouncements.map((ann) => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann as any}
                canDelete={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
