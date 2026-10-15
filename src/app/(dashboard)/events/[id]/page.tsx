import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { RegistrationButton } from "@/components/events/registration-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  QrCode,
  Lock,
  ChevronLeft,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const user = await requireSession();
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      club: true,
      _count: {
        select: {
          registrations: { where: { status: "CONFIRMED" } },
          attendances: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  // Check user's registration
  const userRegistration = await prisma.registration.findUnique({
    where: {
      eventId_userId: { eventId: event.id, userId: user.id },
    },
  });

  // Check if current user is admin of this club
  const clubMembership = await prisma.membership.findUnique({
    where: {
      userId_clubId: { userId: user.id, clubId: event.clubId },
    },
  });

  const isClubAdmin =
    user.role === "SUPER_ADMIN" ||
    (clubMembership?.status === "APPROVED" &&
      ["LEAD", "COORDINATOR"].includes(clubMembership.role));

  const now = new Date();
  const isPast = new Date(event.endsAt) < now;
  const isCancelled = event.status === "CANCELLED";
  const deadlinePassed = event.registrationDeadline ? new Date(event.registrationDeadline) < now : false;
  const confirmedCount = event._count.registrations;
  const isFull = event.capacity !== null && confirmedCount >= event.capacity;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/events"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "text-muted-foreground -ml-2",
          })}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Events
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-muted h-64 sm:h-80 w-full shadow-sm">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-primary opacity-90 flex items-center justify-center text-white/30">
            <Calendar className="h-24 w-24" />
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge variant="secondary" className="backdrop-blur-md bg-background/85 font-semibold">
            {event.club.name}
          </Badge>
          {event.isMembersOnly && (
            <Badge variant="default" className="backdrop-blur-md gap-1 bg-amber-600 hover:bg-amber-600">
              <Lock className="h-3 w-3" /> Members Only
            </Badge>
          )}
        </div>

        <div className="absolute top-4 right-4">
          {isCancelled ? (
            <Badge variant="destructive">Cancelled</Badge>
          ) : isPast ? (
            <Badge variant="secondary" className="backdrop-blur-md bg-background/85">
              Concluded
            </Badge>
          ) : (
            <Badge variant="outline" className="backdrop-blur-md bg-background/85 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              Open for Registration
            </Badge>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <Card className="border-border/80 shadow-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                Hosted by {event.club.name}
              </p>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {event.title}
              </CardTitle>
            </div>

            <RegistrationButton
              eventId={event.id}
              registration={userRegistration}
              isPast={isPast}
              isCancelled={isCancelled}
              isFull={isFull}
              deadlinePassed={deadlinePassed}
            />
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60 text-sm">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">{formatDate(new Date(event.startsAt))}</p>
                <p className="text-muted-foreground">
                  {formatTime(new Date(event.startsAt))} – {formatTime(new Date(event.endsAt))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">Venue</p>
                <p className="text-muted-foreground truncate">{event.venue || "TBA"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <div className="text-xs">
                <p className="font-semibold">Attendance Capacity</p>
                <p className="text-muted-foreground">
                  {confirmedCount} {event.capacity ? `/ ${event.capacity} registered` : "registered (unlimited)"}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {/* Admin Controls */}
          {isClubAdmin && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-1.5 text-primary">
                  <ShieldCheck className="h-4 w-4" /> Organizer Attendance & Check-in Desk
                </h4>
                <Badge variant="outline" className="text-[10px]">
                  Admin
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <Link
                  href={`/events/${event.id}/attendance`}
                  className={buttonVariants({
                    size: "sm",
                    className: "gap-1.5",
                  })}
                >
                  <QrCode className="h-4 w-4" />
                  <span>Launch QR Scanner & Check-in</span>
                </Link>
                <Link
                  href={`/api/attendance/export?eventId=${event.id}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "gap-1.5",
                  })}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export CSV</span>
                </Link>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-base font-bold">About this Event</h3>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Club Info Footer */}
          <div className="pt-6 border-t border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Organized by</p>
                <p className="text-sm font-semibold">{event.club.name}</p>
              </div>
            </div>
            <Link
              href={`/clubs/${event.club.slug}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Visit Club Profile
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
