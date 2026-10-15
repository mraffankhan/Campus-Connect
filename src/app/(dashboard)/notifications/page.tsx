import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { NotificationItem } from "@/components/notifications/notification-item";
import { NotificationActions } from "@/components/notifications/notification-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Bell, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireSession();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const hasUnread = notifications.some((n) => !n.read);
  const hasRead = notifications.some((n) => n.read);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Activity Inbox</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Event updates, club approvals, and announcements
          </p>
        </div>

        {notifications.length > 0 && (
          <NotificationActions hasUnread={hasUnread} hasRead={hasRead} />
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up! When you join clubs, register for events, or receive announcements, updates will appear here."
          action={{
            label: "Explore Events",
            href: "/events",
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
