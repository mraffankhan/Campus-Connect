import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { AnnouncementCard } from "@/components/announcements/announcement-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Megaphone, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnnouncementsFeedPage() {
  const user = await requireSession();

  // Fetch approved club memberships of current user
  const userMemberships = await prisma.membership.findMany({
    where: { userId: user.id, status: "APPROVED" },
    select: { clubId: true, role: true },
  });

  const joinedClubIds = userMemberships.map((m) => m.clubId);
  const adminClubIds = new Set(
    userMemberships.filter((m) => ["LEAD", "COORDINATOR"].includes(m.role)).map((m) => m.clubId)
  );

  // Fetch combined feed:
  // 1. College-wide announcements (clubId == null)
  // 2. Announcements for any club the user has joined (or all clubs if user is SUPER_ADMIN)
  const whereClause: any =
    user.role === "SUPER_ADMIN"
      ? {}
      : {
          OR: [{ clubId: null }, { clubId: { in: joinedClubIds } }],
        };

  const announcements = await prisma.announcement.findMany({
    where: whereClause,
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      club: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Campus Feed</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Announcements</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Official campus updates, club reminders, and department notices
        </p>
      </div>

      {/* Feed list */}
      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="When clubs or campus administrators post official notices, they will appear here in your live feed."
          action={{
            label: "Explore Clubs",
            href: "/clubs",
          }}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const canDelete =
              user.role === "SUPER_ADMIN" ||
              (ann.clubId ? adminClubIds.has(ann.clubId) : false);

            return (
              <AnnouncementCard
                key={ann.id}
                announcement={ann as any}
                canDelete={canDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
