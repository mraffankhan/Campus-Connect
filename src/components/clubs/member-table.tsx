"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateMemberStatus,
  updateMemberRole,
  removeMember,
} from "@/actions/memberships";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, formatDate } from "@/lib/utils";
import { Check, X, Trash2, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MemberRole, MemberStatus } from "@prisma/client";

interface MemberRecord {
  id: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    department?: string | null;
    year?: number | null;
  };
}

interface MemberTableProps {
  members: MemberRecord[];
  isClubAdmin: boolean;
  currentUserId: string;
}

export function MemberTable({
  members,
  isClubAdmin,
  currentUserId,
}: MemberTableProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredMembers = members.filter((m) => {
    if (activeTab === "ALL") return true;
    return m.status === activeTab;
  });

  const handleStatusChange = async (membershipId: string, status: MemberStatus) => {
    setProcessingId(membershipId);
    try {
      const res = await updateMemberStatus(membershipId, status);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(
        status === "APPROVED" ? "Member approved!" : "Membership request rejected."
      );
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (membershipId: string, role: MemberRole) => {
    setProcessingId(membershipId);
    try {
      const res = await updateMemberRole(membershipId, role);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(`Role updated to ${role}`);
      router.refresh();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (membershipId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the club?`)) return;

    setProcessingId(membershipId);
    try {
      const res = await removeMember(membershipId);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Member removed from club");
      router.refresh();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = members.filter((m) => m.status === "PENDING").length;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button
          variant={activeTab === "ALL" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("ALL")}
        >
          All Members ({members.length})
        </Button>
        <Button
          variant={activeTab === "APPROVED" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("APPROVED")}
        >
          Approved ({members.filter((m) => m.status === "APPROVED").length})
        </Button>
        {isClubAdmin && (
          <Button
            variant={activeTab === "PENDING" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("PENDING")}
            className="relative"
          >
            Pending Requests ({pendingCount})
            {pendingCount > 0 && (
              <span className="ml-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {filteredMembers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No members found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Student</th>
                  <th className="py-3 px-4 text-left font-semibold">Department & Year</th>
                  <th className="py-3 px-4 text-left font-semibold">Role</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">Joined / Requested</th>
                  {isClubAdmin && (
                    <th className="py-3 px-4 text-right font-semibold">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMembers.map((m) => {
                  const isSelf = m.userId === currentUserId;
                  const isBusy = processingId === m.id;

                  return (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.user.avatarUrl || undefined} alt={m.user.name} />
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {getInitials(m.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm line-clamp-1">{m.user.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {m.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {m.user.department ? (
                          <span>
                            {m.user.department} {m.user.year ? `• Year ${m.user.year}` : ""}
                          </span>
                        ) : (
                          "Not specified"
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {isClubAdmin && !isSelf && m.status === "APPROVED" ? (
                          <Select
                            value={m.role}
                            onValueChange={(val) => {
                              if (val) handleRoleChange(m.id, val as MemberRole);
                            }}
                            disabled={isBusy}
                          >
                            <SelectTrigger className="h-7 text-xs w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MEMBER">Member</SelectItem>
                              <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                              <SelectItem value="LEAD">Lead</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant={m.role === "LEAD" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {m.role}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            m.status === "APPROVED"
                              ? "outline"
                              : m.status === "PENDING"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-[10px]"
                        >
                          {m.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(new Date(m.joinedAt))}
                      </td>
                      {isClubAdmin && (
                        <td className="py-3 px-4 text-right">
                          {isBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {m.status === "PENDING" ? (
                                <>
                                  <Button
                                    size="icon-xs"
                                    variant="outline"
                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                    title="Approve Member"
                                    onClick={() => handleStatusChange(m.id, "APPROVED")}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="icon-xs"
                                    variant="outline"
                                    className="text-destructive hover:bg-destructive/10"
                                    title="Reject Request"
                                    onClick={() => handleStatusChange(m.id, "REJECTED")}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              ) : (
                                !isSelf && (
                                  <Button
                                    size="icon-xs"
                                    variant="ghost"
                                    className="text-muted-foreground hover:text-destructive"
                                    title="Remove from Club"
                                    onClick={() => handleRemove(m.id, m.user.name)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )
                              )}
                            </div>
                          )}
                        </td>
                      )}
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
