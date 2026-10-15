"use server";

import { prisma } from "@/lib/prisma";
import { requireClubAdmin } from "@/lib/auth/require-role";
import { createEventSchema, updateEventSchema, type CreateEventInput, type UpdateEventInput } from "@/schemas/event";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function createEvent(input: CreateEventInput): Promise<ActionResult<{ id: string }>> {
  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid event data" };
  }

  const { clubId, title, description, venue, startsAt, endsAt, capacity, registrationDeadline, isMembersOnly, bannerUrl, status } = parsed.data;

  // Enforce server-side role check: user must be club admin
  await requireClubAdmin(clubId);

  try {
    const event = await prisma.event.create({
      data: {
        clubId,
        title,
        description,
        venue,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        capacity: capacity || null,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        isMembersOnly,
        bannerUrl: bannerUrl || null,
        status,
      },
      include: { club: true },
    });

    // Notify club members about new event
    if (status === "PUBLISHED") {
      const clubMembers = await prisma.membership.findMany({
        where: { clubId, status: "APPROVED" },
        select: { userId: true },
      });

      if (clubMembers.length > 0) {
        await prisma.notification.createMany({
          data: clubMembers.map((m) => ({
            userId: m.userId,
            title: `New Event: ${title}`,
            body: `${event.club.name} scheduled a new event at ${venue}.`,
            link: `/events/${event.id}`,
          })),
        });
      }
    }

    revalidatePath("/events");
    revalidatePath(`/clubs/${event.club.slug}`);
    return { success: true, data: { id: event.id } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create event." };
  }
}

export async function updateEvent(eventId: string, input: UpdateEventInput): Promise<ActionResult> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { club: true },
  });

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  await requireClubAdmin(event.clubId);

  try {
    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && { description: input.description }),
        ...(input.venue && { venue: input.venue }),
        ...(input.startsAt && { startsAt: new Date(input.startsAt) }),
        ...(input.endsAt && { endsAt: new Date(input.endsAt) }),
        ...(input.capacity !== undefined && { capacity: input.capacity || null }),
        ...(input.registrationDeadline !== undefined && {
          registrationDeadline: input.registrationDeadline ? new Date(input.registrationDeadline) : null,
        }),
        ...(input.isMembersOnly !== undefined && { isMembersOnly: input.isMembersOnly }),
        ...(input.bannerUrl !== undefined && { bannerUrl: input.bannerUrl || null }),
        ...(input.status && { status: input.status }),
      },
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    revalidatePath(`/clubs/${event.club.slug}`);
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update event." };
  }
}

export async function cancelEvent(eventId: string): Promise<ActionResult> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      club: true,
      registrations: {
        where: { status: { in: ["CONFIRMED", "WAITLISTED"] } },
        select: { userId: true },
      },
    },
  });

  if (!event) {
    return { success: false, error: "Event not found" };
  }

  await requireClubAdmin(event.clubId);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: { status: "CANCELLED" },
      });

      // Notify all registered and waitlisted students
      if (event.registrations.length > 0) {
        await tx.notification.createMany({
          data: event.registrations.map((r) => ({
            userId: r.userId,
            title: `Event Cancelled: ${event.title}`,
            body: `We regret to inform you that "${event.title}" by ${event.club.name} has been cancelled.`,
            link: `/events/${event.id}`,
          })),
        });
      }
    });

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to cancel event." };
  }
}
