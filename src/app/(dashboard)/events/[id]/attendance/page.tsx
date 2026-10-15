import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { requireClubAdmin } from "@/lib/auth/require-role";
import { QRScanner } from "@/components/attendance/qr-scanner";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  QrCode,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  ChevronLeft,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface AttendancePageProps {
  params: Promise<{ id: string }>;
}

export default async function AttendancePage({ params }: AttendancePageProps) {
  await requireSession();
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      club: true,
      registrations: {
        where: { status: "CONFIRMED" },
        include: {
          user: true,
        },
        orderBy: { registeredAt: "asc" },
      },
      attendances: true,
    },
  });

  if (!event) {
    notFound();
  }

  // Ensure user is authorized to manage attendance for this club
  await requireClubAdmin(event.clubId);

  const totalRegistered = event.registrations.length;
  const totalAttended = event.attendances.length;
  const attendanceRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

  // Map attendances by userId
  const attendanceMap = new Map(
    event.attendances.map((a) => [a.userId, a])
  );

  const participants = event.registrations.map((r) => ({
    userId: r.userId,
    name: r.user.name,
    email: r.user.email,
    department: r.user.department,
    year: r.user.year,
    avatarUrl: r.user.avatarUrl,
    registrationStatus: r.status,
    attendance: attendanceMap.get(r.userId) || null,
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <QrCode className="h-7 w-7 text-primary" />
              <span>Attendance Desk: {event.title}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live scanner and real-time attendance tracking for {event.club.name}
            </p>
          </div>

          <a
            href={`/api/attendance/export?eventId=${event.id}`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-1.5 shrink-0",
            })}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Confirmed Registered
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistered}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Students with confirmed tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Checked In
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{totalAttended}</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Verified attendees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Turnout Rate
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Percentage attended</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Scanner vs Roster */}
      <Tabs defaultValue="scanner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="scanner">Camera QR Scanner</TabsTrigger>
          <TabsTrigger value="roster">Roster & Manual ({totalRegistered})</TabsTrigger>
        </TabsList>

        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scan Student QR Tickets</CardTitle>
              <p className="text-xs text-muted-foreground">
                Point your mobile or laptop camera at the student&apos;s digital ticket QR code.
              </p>
            </CardHeader>
            <CardContent>
              <QRScanner eventId={event.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roster">
          <AttendanceTable
            eventId={event.id}
            participants={participants}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
