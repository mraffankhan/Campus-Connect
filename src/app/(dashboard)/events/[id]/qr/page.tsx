import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { generateQRToken, generateQRCodeDataUrl } from "@/lib/qr/generate";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  QrCode,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface EventQRPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventQRPage({ params }: EventQRPageProps) {
  const user = await requireSession();
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      club: true,
      attendances: { where: { userId: user.id } },
    },
  });

  if (!event) {
    notFound();
  }

  // Check registration
  const registration = await prisma.registration.findUnique({
    where: {
      eventId_userId: { eventId: event.id, userId: user.id },
    },
  });

  if (!registration || registration.status !== "CONFIRMED") {
    redirect(`/events/${event.id}`);
  }

  const isAlreadyAttended = event.attendances.length > 0;

  // Generate signed QR JWT token
  const token = generateQRToken({
    eventId: event.id,
    userId: user.id,
    registrationId: registration.id,
  });

  // Generate QR Code image data URL
  const qrCodeDataUrl = await generateQRCodeDataUrl(token);

  return (
    <div className="space-y-6 max-w-lg mx-auto py-4">
      <div>
        <Link
          href={`/events/${event.id}`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "text-muted-foreground -ml-2",
          })}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Event
        </Link>
      </div>

      {/* Ticket Pass Container */}
      <Card className="border-2 border-primary/40 shadow-2xl overflow-hidden bg-card/95 backdrop-blur-xl relative">
        <div className="h-2 w-full gradient-primary" />

        <CardHeader className="text-center space-y-2 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mx-auto">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Event Entry Pass</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {event.title}
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Organized by {event.club.name}
          </p>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          {/* QR Code Container */}
          <div className="relative mx-auto w-64 h-64 p-3 rounded-2xl bg-white shadow-inner flex flex-col items-center justify-center border-2 border-dashed border-primary/30">
            {isAlreadyAttended ? (
              <div className="flex flex-col items-center justify-center text-emerald-600 space-y-2 p-4">
                <CheckCircle2 className="h-16 w-16" />
                <span className="font-bold text-sm">Checked In</span>
                <span className="text-xs text-muted-foreground">Attendance recorded</span>
              </div>
            ) : (
              <img
                src={qrCodeDataUrl}
                alt="Event Check-in QR Code"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            {isAlreadyAttended
              ? "You have already scanned this ticket for event entry."
              : "Present this secure QR code at the check-in desk for event entrance."}
          </p>

          {/* Student & Event Info Summary */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border/80 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-muted-foreground">Attendee:</span>
              <span className="font-semibold text-foreground">{user.name}</span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-muted-foreground">Department / Year:</span>
              <span className="font-medium text-foreground">
                {user.department || "General"} {user.year ? `• Y${user.year}` : ""}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-muted-foreground">Date & Time:</span>
              <span className="font-medium text-foreground">
                {formatDate(new Date(event.startsAt))} • {formatTime(new Date(event.startsAt))}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Venue:</span>
              <span className="font-medium text-foreground truncate max-w-[200px]">
                {event.venue || "Campus Hall"}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/60 pt-4 bg-muted/20">
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            Ticket ID: {registration.id.substring(0, 12)}
          </Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
