import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClubAdmin } from "@/lib/auth/require-role";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return new NextResponse("Missing eventId parameter", { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: true,
      registrations: {
        include: {
          user: true,
        },
        orderBy: { registeredAt: "asc" },
      },
      attendances: true,
    },
  });

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  // Ensure authorized
  try {
    await requireClubAdmin(event.clubId);
  } catch {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  // Map attendances by userId
  const attendanceMap = new Map(
    event.attendances.map((a) => [a.userId, a])
  );

  // Build CSV content
  const headers = [
    "Student Name",
    "Email",
    "Department",
    "Year",
    "Registration Status",
    "Registration Date",
    "Attended",
    "Check-in Method",
    "Check-in Time",
    "Marked By",
  ];

  const rows = event.registrations.map((reg) => {
    const attendance = attendanceMap.get(reg.userId);
    const attended = !!attendance;

    return [
      `"${reg.user.name.replace(/"/g, '""')}"`,
      `"${reg.user.email}"`,
      `"${reg.user.department || "N/A"}"`,
      reg.user.year ? String(reg.user.year) : "N/A",
      reg.status,
      reg.registeredAt.toISOString(),
      attended ? "YES" : "NO",
      attendance ? attendance.method : "N/A",
      attendance ? attendance.checkedInAt.toISOString() : "N/A",
      attendance?.markedBy ? `"${attendance.markedBy.replace(/"/g, '""')}"` : "N/A",
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const filename = `attendance-${event.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
