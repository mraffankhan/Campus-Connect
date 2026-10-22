import Link from "next/link";
import { requireSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Radio,
  ShieldCheck,
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
      {/* Tactical Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-primary/30 bg-gradient-to-r from-[#180204] via-[#090102] to-[#120103] shadow-[0_8px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(240,0,16,0.25)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 font-mono text-[11px] uppercase tracking-wider text-rose-300">
            <span className="pulse-dot" />
            <span>VERIFIED IDENTITY // {user.role.replace("_", " ")}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
            HELLO, <span className="text-crimson-gradient">{user.name}</span>
          </h1>

          <p className="font-mono text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {user.department ? `${user.department} // CLASS OF ${user.year}` : "CAMPUS PORTAL"}
            {" — "}Real-time access to student societies, encrypted event registration passes, and campus broadcasts.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/clubs"
              className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-md bg-primary text-white font-bold border border-rose-400 shadow-[0_0_20px_rgba(240,0,16,0.6)] hover:bg-[#ff1a2b] transition-all flex items-center gap-2"
            >
              Explore Societies <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/events"
              className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-md border border-primary/35 bg-primary/10 hover:border-primary text-white transition-all hover:shadow-[0_0_15px_rgba(240,0,16,0.3)]"
            >
              Upcoming Events
            </Link>
            <Link
              href="/profile"
              className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-md border border-white/10 hover:border-white/30 text-muted-foreground hover:text-white transition-all"
            >
              View Pass
            </Link>
          </div>
        </div>
      </div>

      {/* Tactical Overview Stat Cards (Inspired by .stat in index.html) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="tactical-card p-5 rounded-xl space-y-2 group">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[11px] uppercase tracking-wider">JOINED CLUBS</span>
            <Users className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white group-hover:text-primary transition-colors">
            {myClubsCount}
          </div>
          <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
            Active Memberships
          </p>
        </div>

        <div className="tactical-card p-5 rounded-xl space-y-2 group">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[11px] uppercase tracking-wider">UPCOMING EVENTS</span>
            <Calendar className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white group-hover:text-primary transition-colors">
            {upcomingRegistrations.length}
          </div>
          <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
            Confirmed Passes
          </p>
        </div>

        <div className="tactical-card p-5 rounded-xl space-y-2 group">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[11px] uppercase tracking-wider">ATTENDANCE RATE</span>
            <CheckCircle2 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-heading font-extrabold text-3xl sm:text-4xl text-white group-hover:text-primary transition-colors">
            {attendanceRate}%
          </div>
          <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
            {attendanceStats.attended} of {attendanceStats.total} events verified
          </p>
        </div>

        <div className="tactical-card p-5 rounded-xl space-y-2 group">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-mono text-[11px] uppercase tracking-wider">ACCESS CLEARANCE</span>
            <ShieldCheck className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </div>
          <div className="font-heading font-extrabold text-2xl sm:text-3xl uppercase text-white truncate group-hover:text-primary transition-colors">
            {user.role.replace("_", " ")}
          </div>
          <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
            Cryptographic Clearance
          </p>
        </div>
      </div>

      {/* Two columns: Upcoming Events & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events Column */}
        <div className="tactical-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-primary/20 mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold block mb-1">
                  // RADAR SCHEDULE
                </span>
                <h2 className="font-heading font-bold text-xl uppercase tracking-wide text-white">
                  Your Event Passes
                </h2>
              </div>
              <Link
                href="/my-events"
                className="font-mono text-xs uppercase tracking-wider text-rose-300 hover:text-white underline"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingRegistrations.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                  <p className="font-mono text-xs uppercase tracking-wider">No active event tickets</p>
                  <Link
                    href="/events"
                    className="font-mono text-xs uppercase tracking-wider text-primary underline mt-2 inline-block font-semibold"
                  >
                    Browse Campus Events &rarr;
                  </Link>
                </div>
              ) : (
                upcomingRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-xl border border-primary/25 bg-[#0e0204] hover:border-primary/50 transition-all flex items-center justify-between gap-3 shadow-[inset_0_1px_0_rgba(240,0,16,0.15)] group"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="font-heading font-bold uppercase text-sm text-white truncate group-hover:text-primary transition-colors">
                        {reg.event.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {formatDate(new Date(reg.event.startsAt))} • {formatTime(new Date(reg.event.startsAt))}
                        </span>
                        {reg.event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {reg.event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/events/${reg.event.id}`}
                      className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded bg-primary/20 text-white border border-primary/40 hover:bg-primary hover:border-primary transition-all shrink-0 font-bold"
                    >
                      Ticket
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Announcements Column */}
        <div className="tactical-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-primary/20 mb-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold block mb-1">
                  // TELEMETRY
                </span>
                <h2 className="font-heading font-bold text-xl uppercase tracking-wide text-white">
                  Campus Broadcasts
                </h2>
              </div>
              <Link
                href="/announcements"
                className="font-mono text-xs uppercase tracking-wider text-rose-300 hover:text-white underline"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {recentAnnouncements.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  <Megaphone className="h-8 w-8 mx-auto mb-2 text-primary/40" />
                  <p className="font-mono text-xs uppercase tracking-wider">No active announcements</p>
                </div>
              ) : (
                recentAnnouncements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3.5 rounded-xl border border-primary/25 bg-[#0e0204] hover:border-primary/50 transition-all space-y-1.5 shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-heading font-bold uppercase text-sm text-white truncate">
                        {ann.title}
                      </h4>
                      {ann.pinned && (
                        <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 border border-primary/50 text-rose-200">
                          PINNED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {ann.body}
                    </p>
                    <div className="text-[11px] font-mono text-muted-foreground pt-1 flex items-center justify-between border-t border-primary/15">
                      <span className="text-primary font-medium">
                        {ann.club ? ann.club.name : "College-wide Broadcast"}
                      </span>
                      <span>{formatDate(new Date(ann.createdAt))}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
