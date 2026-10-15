"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { approveClub, suspendClub } from "@/actions/clubs";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Check, ShieldAlert, RotateCcw, ExternalLink, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { ClubStatus } from "@prisma/client";

interface ClubItem {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  status: ClubStatus;
  createdAt: Date | string;
  _count: {
    memberships: number;
    events: number;
  };
}

interface AdminClubTableProps {
  clubs: ClubItem[];
}

export function AdminClubTable({ clubs }: AdminClubTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "ACTIVE" | "SUSPENDED">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = clubs.filter((c) => {
    if (filter === "ALL") return true;
    return c.status === filter;
  });

  const handleApprove = async (clubId: string) => {
    setBusyId(clubId);
    try {
      const res = await approveClub(clubId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Club has been approved and activated!");
      router.refresh();
    } catch {
      toast.error("Failed to approve club");
    } finally {
      setBusyId(null);
    }
  };

  const handleSuspendToggle = async (clubId: string, willSuspend: boolean) => {
    setBusyId(clubId);
    try {
      const res = await suspendClub(clubId, willSuspend);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(willSuspend ? "Club suspended." : "Club reactivated.");
      router.refresh();
    } catch {
      toast.error("Failed to update club status");
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = clubs.filter((c) => c.status === "PENDING").length;

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button
          variant={filter === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ALL")}
        >
          All Clubs ({clubs.length})
        </Button>
        <Button
          variant={filter === "PENDING" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("PENDING")}
          className="relative"
        >
          Pending Approval ({pendingCount})
          {pendingCount > 0 && (
            <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </Button>
        <Button
          variant={filter === "ACTIVE" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("ACTIVE")}
        >
          Active ({clubs.filter((c) => c.status === "ACTIVE").length})
        </Button>
        <Button
          variant={filter === "SUSPENDED" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("SUSPENDED")}
        >
          Suspended ({clubs.filter((c) => c.status === "SUSPENDED").length})
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No clubs found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Club Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Category</th>
                  <th className="py-3 px-4 text-left font-semibold">Members</th>
                  <th className="py-3 px-4 text-left font-semibold">Events</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">Submitted</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((c) => {
                  const isBusy = busyId === c.id;

                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/clubs/${c.slug}`}
                          className="font-semibold text-sm hover:underline flex items-center gap-1.5"
                        >
                          <span>{c.name}</span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {c.category || "General"}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium">
                        {c._count.memberships}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium">
                        {c._count.events}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            c.status === "ACTIVE"
                              ? "outline"
                              : c.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(new Date(c.createdAt))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleApprove(c.id)}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                            )}

                            {c.status === "ACTIVE" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10"
                                onClick={() => handleSuspendToggle(c.id, true)}
                              >
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Suspend
                              </Button>
                            )}

                            {c.status === "SUSPENDED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                                onClick={() => handleSuspendToggle(c.id, false)}
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reactivate
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
