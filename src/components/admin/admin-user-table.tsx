"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/actions/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, formatDate } from "@/lib/utils";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  year: number | null;
  avatarUrl: string | null;
  createdAt: Date | string;
  _count: {
    memberships: number;
    registrations: number;
  };
}

interface AdminUserTableProps {
  users: UserItem[];
  currentAdminId: string;
}

export function AdminUserTable({ users, currentAdminId }: AdminUserTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleRoleChange = async (userId: string, role: Role) => {
    setBusyUserId(userId);
    try {
      const res = await updateUserRole(userId, role);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("User role updated");
      router.refresh();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs"
          />
        </div>

        <Select value={roleFilter} onValueChange={(val) => { if (val) setRoleFilter(val); }}>
          <SelectTrigger className="w-full sm:w-44 text-xs">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="STUDENT">Students</SelectItem>
            <SelectItem value="CLUB_ADMIN">Club Admins</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No campus users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">User</th>
                  <th className="py-3 px-4 text-left font-semibold">Department & Year</th>
                  <th className="py-3 px-4 text-left font-semibold">Clubs</th>
                  <th className="py-3 px-4 text-left font-semibold">Events</th>
                  <th className="py-3 px-4 text-left font-semibold">Registered</th>
                  <th className="py-3 px-4 text-right font-semibold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((u) => {
                  const isSelf = u.id === currentAdminId;
                  const isBusy = busyUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatarUrl || undefined} alt={u.name} />
                            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                              {getInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-xs flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                  You
                                </Badge>
                              )}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {u.department ? `${u.department} ${u.year ? `• Y${u.year}` : ""}` : "General"}
                      </td>

                      <td className="py-3 px-4 text-xs font-medium">
                        {u._count.memberships}
                      </td>

                      <td className="py-3 px-4 text-xs font-medium">
                        {u._count.registrations}
                      </td>

                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(new Date(u.createdAt))}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
                        ) : (
                          <Select
                            value={u.role}
                            onValueChange={(val) => {
                              if (val) handleRoleChange(u.id, val as Role);
                            }}
                          >
                            <SelectTrigger className="h-7 text-xs w-[130px] ml-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="CLUB_ADMIN">Club Admin</SelectItem>
                              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
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
