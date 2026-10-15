"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/actions/notifications";
import { formatRelativeDate } from "@/lib/utils";
import { Bell, Check, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    body: string;
    link: string | null;
    read: boolean;
    createdAt: Date | string;
  };
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const [read, setRead] = useState(notification.read);

  const handleClick = async () => {
    if (!read) {
      setRead(true);
      await markNotificationRead(notification.id);
      router.refresh();
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!read) {
      setRead(true);
      await markNotificationRead(notification.id);
      router.refresh();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
        read
          ? "bg-card/40 border-border/60 hover:bg-muted/30"
          : "bg-card border-primary/40 shadow-xs hover:border-primary/60"
      }`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          read
            ? "bg-muted text-muted-foreground"
            : "gradient-primary text-white shadow-xs"
        }`}
      >
        <Bell className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4
            className={`text-sm font-semibold truncate ${
              !read ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {notification.title}
          </h4>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {formatRelativeDate(new Date(notification.createdAt))}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {notification.body}
        </p>

        {notification.link && (
          <p className="text-[11px] text-primary flex items-center gap-1 font-medium pt-0.5">
            <span>View details</span>
            <ExternalLink className="h-3 w-3" />
          </p>
        )}
      </div>

      {!read && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 text-muted-foreground hover:text-primary"
          onClick={handleMarkRead}
          title="Mark as read"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
