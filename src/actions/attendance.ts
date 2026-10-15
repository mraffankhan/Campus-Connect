"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { requireClubAdmin } from "@/lib/auth/require-role";
import { verifyQRToken } from "@/lib/qr/verify";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function toggleManualAttendance(
  eventId: string,
  userId: string,
  shouldAttend: boolean
): Promise<ActionResult> {
  const currentAdmin = await requireSession();

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  await requireClubAdmin(event.clubId);

  try {
    if (shouldAttend) {
      // Upsert attendance
      await prisma.attendance.upsert({
        where: {
          eventId_userId: { eventId, userId },
        },
        create: {
          eventId,
          userId,
          method: "MANUAL",
          markedBy: currentAdmin.name,
        },
        update: {
          checkedInAt: new Date(),
          method: "MANUAL",
          markedBy: currentAdmin.name,
        },
      });
    } else {
      await prisma.attendance.deleteMany({
        where: { eventId, userId },
      });
    }

    revalidatePath(`/events/${eventId}/attendance`);
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update attendance." };
  }
}

export async function checkInWithToken(
  token: string
): Promise<ActionResult<{ studentName: string; department: string | null; time: string }>> {
  const admin = await requireSession();

  const payload = verifyQRToken(token);
  if (!payload) {
    return { success: false, error: "Invalid or expired QR ticket." };
  }

  const { eventId, userId } = payload;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { club: true },
  });

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  await requireClubAdmin(event.clubId);

  // Check student registration
  const registration = await prisma.registration.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
    include: { user: true },
  });

  if (!registration || registration.status !== "CONFIRMED") {
    return {
      success: false,
      error: "Student does not have a confirmed registration for this event.",
    };
  }

  // Check if already checked in
  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (existingAttendance) {
    return {
      success: false,
      error: `${registration.user.name} is ALREADY checked in!`,
    };
  }

  const attendance = await prisma.attendance.create({
    data: {
      eventId,
      userId,
      method: "QR",
      markedBy: admin.name,
    },
  });

  // Notify student of successful check-in
  await prisma.notification.create({
    data: {
      userId,
      title: "Checked In Successfully!",
      body: `Your attendance for "${event.title}" has been recorded. Enjoy the event!`,
      link: `/events/${event.id}`,
    },
  });

  revalidatePath(`/events/${eventId}/attendance`);
  return {
    success: true,
    data: {
      studentName: registration.user.name,
      department: registration.user.department,
      time: attendance.checkedInAt.toLocaleTimeString(),
    },
  };
}
