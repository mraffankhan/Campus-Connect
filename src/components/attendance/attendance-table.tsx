"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleManualAttendance } from "@/actions/attendance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/lib/utils";
import { Check, X, Search, Loader2, QrCode, UserCheck } from "lucide-react";
import { toast } from "sonner";
import type { CheckInMethod } from "@prisma/client";

interface ParticipantItem {
  userId: string;
  name: string;
  email: string;
  department: string | null;
  year: number | null;
  avatarUrl: string | null;
  registrationStatus: string;
  attendance: {
    checkedInAt: Date | string;
    method: CheckInMethod;
    markedBy: string | null;
  } | null;
}

interface AttendanceTableProps {
  eventId: string;
  participants: ParticipantItem[];
}

export function AttendanceTable({ eventId, participants }: AttendanceTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"ALL" | "ATTENDED" | "ABSENT">("ALL");
  const [search, setSearch] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const filtered = participants.filter((p) => {
    const isAttended = !!p.attendance;
    if (filter === "ATTENDED" && !isAttended) return false;
    if (filter === "ABSENT" && isAttended) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.department && p.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleToggle = async (userId: string, shouldAttend: boolean) => {
    setBusyUserId(userId);
    try {
      const res = await toggleManualAttendance(eventId, userId, shouldAttend);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(shouldAttend ? "Marked as attended" : "Unmarked attendance");
      router.refresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setBusyUserId(null);
    }
  };

  const attendedCount = participants.filter((p) => !!p.attendance).length;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ALL")}
          >
            All ({participants.length})
          </Button>
          <Button
            variant={filter === "ATTENDED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ATTENDED")}
          >
            Attended ({attendedCount})
          </Button>
          <Button
            variant={filter === "ABSENT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ABSENT")}
          >
            Absent ({participants.length - attendedCount})
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search attendee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No attendees match the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Student</th>
                  <th className="py-3 px-4 text-left font-semibold">Department & Year</th>
                  <th className="py-3 px-4 text-left font-semibold">Status</th>
                  <th className="py-3 px-4 text-left font-semibold">Check-in Info</th>
                  <th className="py-3 px-4 text-right font-semibold">Manual Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((p) => {
                  const isAttended = !!p.attendance;
                  const isBusy = busyUserId === p.userId;

                  return (
                    <tr key={p.userId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={p.avatarUrl || undefined} alt={p.name} />
                            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                              {getInitials(p.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-xs">{p.name}</p>
                            <p className="text-[11px] text-muted-foreground">{p.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {p.department ? `${p.department} ${p.year ? `• Y${p.year}` : ""}` : "General"}
                      </td>

                      <td className="py-3 px-4">
                        {isAttended ? (
                          <Badge
                            variant="outline"
                            className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                          >
                            Attended
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Not Checked In
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {p.attendance ? (
                          <span className="flex items-center gap-1">
                            {p.attendance.method === "QR" ? (
                              <QrCode className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            {p.attendance.method} (
                            {new Date(p.attendance.checkedInAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            )
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
                        ) : isAttended ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            onClick={() => handleToggle(p.userId, false)}
                          >
                            Uncheck
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                            onClick={() => handleToggle(p.userId, true)}
                          >
                            Mark Present
                          </Button>
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
