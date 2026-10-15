"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function registerForEvent(
  eventId: string
): Promise<ActionResult<{ status: "CONFIRMED" | "WAITLISTED" }>> {
  const user = await requireSession();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch event with club and current registrations count
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          club: true,
        },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      if (event.status !== "PUBLISHED") {
        throw new Error("This event is not open for registration");
      }

      // 2. Check registration deadline
      if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        throw new Error("The registration deadline for this event has passed");
      }

      // 3. Check isMembersOnly restriction
      if (event.isMembersOnly && user.role !== "SUPER_ADMIN") {
        const membership = await tx.membership.findUnique({
          where: {
            userId_clubId: { userId: user.id, clubId: event.clubId },
          },
        });

        if (!membership || membership.status !== "APPROVED") {
          throw new Error("This event is reserved exclusively for approved club members");
        }
      }

      // 4. Check if already registered
      const existing = await tx.registration.findUnique({
        where: {
          eventId_userId: { eventId, userId: user.id },
        },
      });

      if (existing) {
        if (existing.status === "CONFIRMED") {
          throw new Error("You are already registered for this event");
        }
        if (existing.status === "WAITLISTED") {
          throw new Error("You are currently on the waitlist for this event");
        }
      }

      // 5. Check capacity
      const confirmedCount = await tx.registration.count({
        where: {
          eventId,
          status: "CONFIRMED",
        },
      });

      const hasCapacity = event.capacity === null || confirmedCount < event.capacity;
      const registrationStatus: "CONFIRMED" | "WAITLISTED" = hasCapacity ? "CONFIRMED" : "WAITLISTED";

      if (existing) {
        // Re-activating a previously cancelled registration
        await tx.registration.update({
          where: { id: existing.id },
          data: {
            status: registrationStatus,
            registeredAt: new Date(),
          },
        });
      } else {
        await tx.registration.create({
          data: {
            eventId,
            userId: user.id,
            status: registrationStatus,
          },
        });
      }

      // 6. Notify user
      if (registrationStatus === "CONFIRMED") {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: "Registration Confirmed!",
            body: `You are confirmed for "${event.title}". Access your QR ticket in your dashboard.`,
            link: `/events/${event.id}/qr`,
          },
        });
      } else {
        await tx.notification.create({
          data: {
            userId: user.id,
            title: "Added to Waitlist",
            body: `Capacity reached for "${event.title}". You are on the waitlist and will be auto-promoted if a spot opens up.`,
            link: `/events/${event.id}`,
          },
        });
      }

      return { status: registrationStatus };
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/my-events");
    revalidatePath("/home");
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || "Registration failed" };
  }
}

export async function cancelRegistration(eventId: string): Promise<ActionResult> {
  const user = await requireSession();

  try {
    await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.findUnique({
        where: {
          eventId_userId: { eventId, userId: user.id },
        },
        include: { event: true },
      });

      if (!registration || registration.status === "CANCELLED") {
        throw new Error("No active registration found to cancel");
      }

      const wasConfirmed = registration.status === "CONFIRMED";

      // Mark current user as cancelled
      await tx.registration.update({
        where: { id: registration.id },
        data: { status: "CANCELLED" },
      });

      // If was confirmed, automatically promote oldest waitlisted participant
      if (wasConfirmed) {
        const nextInLine = await tx.registration.findFirst({
          where: {
            eventId,
            status: "WAITLISTED",
          },
          orderBy: { registeredAt: "asc" },
          include: { user: true },
        });

        if (nextInLine) {
          await tx.registration.update({
            where: { id: nextInLine.id },
            data: { status: "CONFIRMED" },
          });

          // Send immediate promotion notification
          await tx.notification.create({
            data: {
              userId: nextInLine.userId,
              title: "Waitlist Promotion!",
              body: `Great news! A spot opened up and you are now confirmed for "${registration.event.title}".`,
              link: `/events/${eventId}/qr`,
            },
          });
        }
      }
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/my-events");
    revalidatePath("/home");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to cancel registration" };
  }
}
