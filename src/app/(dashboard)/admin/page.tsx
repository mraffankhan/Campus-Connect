import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireRole("SUPER_ADMIN");

  const [
    totalUsers,
    studentCount,
    clubAdminCount,
    totalClubs,
    pendingClubs,
    activeClubs,
    totalEvents,
    upcomingEvents,
    totalRegistrations,
    totalAttendances,
    recentClubs,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "CLUB_ADMIN" } }),
    prisma.club.count(),
    prisma.club.count({ where: { status: "PENDING" } }),
    prisma.club.count({ where: { status: "ACTIVE" } }),
    prisma.event.count(),
    prisma.event.count({ where: { startsAt: { gte: new Date() } } }),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.attendance.count(),
    prisma.club.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const overallAttendanceRate =
    totalRegistrations > 0
      ? Math.round((totalAttendances / totalRegistrations) * 100)
      : 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Super Administrator Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Campus Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            College-wide engagement metrics, student registrations, and club approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/clubs"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            Review Clubs ({pendingClubs} pending)
          </Link>
          <Link
            href="/admin/announcements"
            className={buttonVariants({ size: "sm" })}
          >
            <Megaphone className="mr-1.5 h-4 w-4" />
            Broadcast Notice
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total Campus Users
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {studentCount} Students • {clubAdminCount} Club Admins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Campus Clubs
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClubs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeClubs} Active • <span className="text-amber-500 font-semibold">{pendingClubs} Pending</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Events Published
            </CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingEvents} Upcoming Scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Overall Attendance Turnout
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalAttendances} verified checks / {totalRegistrations} registered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two columns: Pending / Recent Clubs & New Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clubs summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Recent Club Submissions</CardTitle>
              <CardDescription>Applications awaiting review and active chapters</CardDescription>
            </div>
            <Link
              href="/admin/clubs"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Manage all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentClubs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No clubs created yet.</p>
            ) : (
              recentClubs.map((club) => (
                <div
                  key={club.id}
                  className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{club.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {club.category || "General"} • {formatDate(new Date(club.createdAt))}
                    </p>
                  </div>
                  <Badge
                    variant={
                      club.status === "ACTIVE"
                        ? "outline"
                        : club.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {club.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Users summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Recent Registrations</CardTitle>
              <CardDescription>Newly joined students and faculty accounts</CardDescription>
            </div>
            <Link
              href="/admin/users"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Manage users
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-xl border border-border bg-card/60 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {u.role.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
