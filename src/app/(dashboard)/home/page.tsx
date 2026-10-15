import Link from "next/link";
import { requireSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Megaphone,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireSession();

  let myClubsCount = 0;
  let upcomingRegistrations: any[] = [];
  let recentAnnouncements: any[] = [];
  let attendanceStats = { attended: 0, total: 0 };

  try {
    const [clubsCount, registrations, announcements, attendances, totalRegs] =
      await Promise.all([
        prisma.membership.count({
          where: {
            userId: user.id,
            status: "APPROVED",
          },
        }),
        prisma.registration.findMany({
          where: {
            userId: user.id,
            status: "CONFIRMED",
            event: {
              startsAt: { gte: new Date() },
            },
          },
          include: {
            event: {
              include: {
                club: {
                  select: { name: true, slug: true },
                },
              },
            },
          },
          take: 3,
          orderBy: { event: { startsAt: "asc" } },
        }),
        prisma.announcement.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { name: true } },
            club: { select: { name: true, slug: true } },
          },
        }),
        prisma.attendance.count({
          where: { userId: user.id },
        }),
        prisma.registration.count({
          where: { userId: user.id, status: "CONFIRMED" },
        }),
      ]);

    myClubsCount = clubsCount;
    upcomingRegistrations = registrations;
    recentAnnouncements = announcements;
    attendanceStats = { attended: attendances, total: totalRegs };
  } catch {
    // DB might be setting up
  }

  const attendanceRate =
    attendanceStats.total > 0
      ? Math.round((attendanceStats.attended / attendanceStats.total) * 100)
      : 100;

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 gradient-subtle border border-border/80 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Welcome to your campus portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Hello, <span className="text-gradient">{user.name}</span>!
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
            {user.department ? `${user.department} • Year ${user.year}` : "Student Portal"}
            {" — "}Stay engaged with campus life, join your favorite clubs, and attend exciting college events.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/clubs" className={buttonVariants({ size: "sm" })}>
              Explore Clubs <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
            <Link
              href="/events"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Upcoming Events
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Joined Clubs
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myClubsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active memberships</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming Events
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingRegistrations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed registrations</p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance Record
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {attendanceStats.attended} of {attendanceStats.total} events attended
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Portal Role
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Megaphone className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {user.role.toLowerCase().replace("_", " ")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Access status</p>
          </CardContent>
        </Card>
      </div>

      {/* Two columns: Upcoming Events & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events Column */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Your Upcoming Events</CardTitle>
              <CardDescription>Events you are currently registered for</CardDescription>
            </div>
            <Link
              href="/my-events"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {upcomingRegistrations.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No upcoming events registered.</p>
                <Link
                  href="/events"
                  className={buttonVariants({ variant: "link", size: "sm", className: "mt-1" })}
                >
                  Find campus events to attend
                </Link>
              </div>
            ) : (
              upcomingRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{reg.event.title}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(new Date(reg.event.startsAt))} • {formatTime(new Date(reg.event.startsAt))}
                      </span>
                      {reg.event.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {reg.event.venue}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/events/${reg.event.id}`}
                    className={buttonVariants({ size: "sm", variant: "secondary", className: "shrink-0" })}
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Announcements Column */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Campus Announcements</CardTitle>
              <CardDescription>Updates from administration and joined clubs</CardDescription>
            </div>
            <Link
              href="/announcements"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            {recentAnnouncements.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No announcements yet.</p>
              </div>
            ) : (
              recentAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold truncate">{ann.title}</h4>
                    {ann.pinned && (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {ann.body}
                  </p>
                  <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
                    <span>
                      {ann.club ? ann.club.name : "College-wide"}
                    </span>
                    <span>{formatDate(new Date(ann.createdAt))}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
