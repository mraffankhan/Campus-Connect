"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead, clearReadNotifications } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { CheckCheck, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NotificationActionsProps {
  hasUnread: boolean;
  hasRead: boolean;
}

export function NotificationActions({ hasUnread, hasRead }: NotificationActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleMarkAll = async () => {
    setLoading(true);
    try {
      const res = await markAllNotificationsRead();
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("All marked as read");
      router.refresh();
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setLoading(false);
    }
  };

  const handleClearRead = async () => {
    setLoading(true);
    try {
      const res = await clearReadNotifications();
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Read notifications cleared");
      router.refresh();
    } catch {
      toast.error("Failed to clear notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {hasUnread && (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={handleMarkAll}
          className="text-xs gap-1.5"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCheck className="h-3.5 w-3.5" />
          )}
          <span>Mark All as Read</span>
        </Button>
      )}

      {hasRead && (
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={handleClearRead}
          className="text-xs text-muted-foreground hover:text-destructive gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear Read</span>
        </Button>
      )}
    </div>
  );
}
