import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  CalendarCheck,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyEventsPage() {
  const user = await requireSession();

  const registrations = await prisma.registration.findMany({
    where: {
      userId: user.id,
      status: { in: ["CONFIRMED", "WAITLISTED"] },
    },
    include: {
      event: {
        include: {
          club: { select: { name: true, slug: true } },
          attendances: { where: { userId: user.id } },
        },
      },
    },
    orderBy: { event: { startsAt: "asc" } },
  });

  const now = new Date();
  const upcoming = registrations.filter((r) => new Date(r.event.endsAt) >= now);
  const past = registrations.filter((r) => new Date(r.event.endsAt) < now);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarCheck className="h-3.5 w-3.5" />
            <span>My Bookings</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Events & Passes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Access your QR entry passes, check waitlist status, and review attendance history
          </p>
        </div>

        <Link
          href="/events"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          <Calendar className="mr-1.5 h-4 w-4" />
          Find More Events
        </Link>
      </div>

      {/* Upcoming Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span>Upcoming Events</span>
          <Badge variant="secondary" className="text-xs">
            {upcoming.length}
          </Badge>
        </h2>

        {upcoming.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming events registered"
            description="You don't have any event registrations scheduled. Browse upcoming workshops, hackathons, and seminars."
            action={{
              label: "Explore Events",
              href: "/events",
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcoming.map((reg) => (
              <Card
                key={reg.id}
                className="flex flex-col justify-between overflow-hidden border-border/80 bg-card/80 hover:border-primary/50 transition-all shadow-sm"
              >
                <CardHeader className="space-y-2 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-primary">
                      {reg.event.club.name}
                    </span>
                    <Badge
                      variant={reg.status === "CONFIRMED" ? "default" : "secondary"}
                      className={
                        reg.status === "CONFIRMED"
                          ? "bg-emerald-600 hover:bg-emerald-600 text-[10px]"
                          : "text-amber-600 dark:text-amber-400 text-[10px]"
                      }
                    >
                      {reg.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg line-clamp-1">{reg.event.title}</h3>
                </CardHeader>

                <CardContent className="space-y-2 pb-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      {formatDate(new Date(reg.event.startsAt))} • {formatTime(new Date(reg.event.startsAt))}
                    </span>
                  </div>

                  {reg.event.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{reg.event.venue}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                  {reg.status === "CONFIRMED" ? (
                    <Link
                      href={`/events/${reg.event.id}/qr`}
                      className={buttonVariants({
                        size: "sm",
                        className: "gap-1.5 font-medium shadow-sm",
                      })}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>View QR Ticket</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Waitlisted (Priority {formatDate(new Date(reg.registeredAt))})
                    </span>
                  )}

                  <Link
                    href={`/events/${reg.event.id}`}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "sm",
                      className: "text-xs",
                    })}
                  >
                    <span>Event Details</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Events Section */}
      {past.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border/60">
          <h2 className="text-xl font-bold flex items-center gap-2 text-muted-foreground">
            <span>Past Events History</span>
            <Badge variant="outline" className="text-xs">
              {past.length}
            </Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {past.map((reg) => {
              const attended = reg.event.attendances.length > 0;

              return (
                <div
                  key={reg.id}
                  className="p-4 rounded-xl border border-border bg-card/50 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{reg.event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(reg.event.startsAt))} • {reg.event.club.name}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {attended ? (
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                        Attended
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        Absent
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
