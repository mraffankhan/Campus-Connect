"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAnnouncement } from "@/actions/announcements";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Megaphone, Pin, Trash2, Loader2, Building2 } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import type { AnnouncementWithAuthor } from "@/types";

interface AnnouncementCardProps {
  announcement: AnnouncementWithAuthor;
  canDelete?: boolean;
}

export function AnnouncementCard({ announcement, canDelete }: AnnouncementCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    setLoading(true);
    try {
      const res = await deleteAnnouncement(announcement.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Announcement deleted.");
      router.refresh();
    } catch {
      toast.error("Failed to delete announcement.");
    } finally {
      setLoading(false);
    }
  };

  const isCollegeWide = !announcement.clubId;

  return (
    <Card className="border-border/80 bg-card/80 backdrop-blur-sm shadow-sm transition-all hover:border-primary/40">
      <CardHeader className="pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={announcement.author.avatarUrl || undefined}
                alt={announcement.author.name}
              />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {getInitials(announcement.author.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{announcement.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(new Date(announcement.createdAt))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {announcement.pinned && (
              <Badge variant="default" className="text-[10px] gap-1 bg-amber-600 hover:bg-amber-600">
                <Pin className="h-3 w-3" /> Pinned
              </Badge>
            )}

            {isCollegeWide ? (
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                College-Wide
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                {announcement.club?.name || "Club Notice"}
              </Badge>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-destructive ml-1"
                disabled={loading}
                onClick={handleDelete}
                title="Delete Announcement"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>

        <h3 className="font-bold text-lg leading-snug">{announcement.title}</h3>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {announcement.body}
        </p>
      </CardContent>
    </Card>
  );
}
