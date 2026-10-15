"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { joinClub, leaveClub } from "@/actions/memberships";
import { Loader2, UserPlus, UserCheck, Clock, LogOut } from "lucide-react";
import { toast } from "sonner";
import type { MemberRole, MemberStatus } from "@prisma/client";

interface JoinButtonProps {
  clubId: string;
  membership?: {
    id: string;
    role: MemberRole;
    status: MemberStatus;
  } | null;
}

export function JoinButton({ clubId, membership }: JoinButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await joinClub(clubId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Join request submitted to club coordinators!");
      router.refresh();
    } catch {
      toast.error("Failed to submit join request");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this club?")) return;

    setLoading(true);
    try {
      const res = await leaveClub(clubId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("You have left the club.");
      router.refresh();
    } catch {
      toast.error("Failed to leave club");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Button disabled size="sm" variant="outline" className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (!membership) {
    return (
      <Button onClick={handleJoin} size="sm" className="gap-2">
        <UserPlus className="h-4 w-4" />
        Join Club
      </Button>
    );
  }

  if (membership.status === "PENDING") {
    return (
      <Button variant="secondary" size="sm" disabled className="gap-2 cursor-default">
        <Clock className="h-4 w-4 text-amber-500" />
        Request Pending
      </Button>
    );
  }

  if (membership.status === "APPROVED") {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled className="gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          <UserCheck className="h-4 w-4" />
          {membership.role.toLowerCase()}
        </Button>
        <Button
          onClick={handleLeave}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          title="Leave Club"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleJoin} size="sm" variant="outline" className="gap-2">
      <UserPlus className="h-4 w-4" />
      Re-apply to Join
    </Button>
  );
}
