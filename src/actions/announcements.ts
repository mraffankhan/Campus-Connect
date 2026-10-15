"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { requireRole, requireClubAdmin } from "@/lib/auth/require-role";
import { createAnnouncementSchema, type CreateAnnouncementInput } from "@/schemas/announcement";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(
  input: CreateAnnouncementInput
): Promise<ActionResult<{ id: string }>> {
  const user = await requireSession();

  const parsed = createAnnouncementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { clubId, title, body, pinned } = parsed.data;

  // Authorization check
  if (!clubId) {
    // College-wide requires SUPER_ADMIN
    await requireRole("SUPER_ADMIN");
  } else {
    // Club-scoped requires Club Admin
    await requireClubAdmin(clubId);
  }

  try {
    const announcement = await prisma.$transaction(async (tx) => {
      const created = await tx.announcement.create({
        data: {
          clubId: clubId || null,
          authorId: user.id,
          title,
          body,
          pinned,
        },
        include: { club: true },
      });

      // Distribute in-app notifications
      if (clubId) {
        const members = await tx.membership.findMany({
          where: { clubId, status: "APPROVED", userId: { not: user.id } },
          select: { userId: true },
        });

        if (members.length > 0) {
          await tx.notification.createMany({
            data: members.map((m) => ({
              userId: m.userId,
              title: `${created.club?.name || "Club"} Announcement`,
              body: title,
              link: `/announcements`,
            })),
          });
        }
      } else {
        // College-wide: notify all active students
        const allStudents = await tx.user.findMany({
          where: { id: { not: user.id } },
          select: { id: true },
          take: 500, // safeguard batch limit
        });

        if (allStudents.length > 0) {
          await tx.notification.createMany({
            data: allStudents.map((s) => ({
              userId: s.id,
              title: "College-Wide Announcement",
              body: title,
              link: `/announcements`,
            })),
          });
        }
      }

      return created;
    });

    revalidatePath("/announcements");
    revalidatePath("/home");
    if (clubId) {
      revalidatePath(`/clubs/${announcement.club?.slug}`);
    } else {
      revalidatePath("/admin/announcements");
    }

    return { success: true, data: { id: announcement.id } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to post announcement." };
  }
}

export async function deleteAnnouncement(announcementId: string): Promise<ActionResult> {
  const user = await requireSession();

  const announcement = await prisma.announcement.findUnique({
    where: { id: announcementId },
  });

  if (!announcement) {
    return { success: false, error: "Announcement not found" };
  }

  if (announcement.clubId) {
    await requireClubAdmin(announcement.clubId);
  } else {
    await requireRole("SUPER_ADMIN");
  }

  try {
    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    revalidatePath("/announcements");
    revalidatePath("/home");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete announcement." };
  }
}
