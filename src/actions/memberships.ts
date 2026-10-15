"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { requireClubAdmin } from "@/lib/auth/require-role";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";
import type { MemberRole, MemberStatus } from "@prisma/client";

export async function joinClub(clubId: string): Promise<ActionResult> {
  const user = await requireSession();

  const club = await prisma.club.findUnique({
    where: { id: clubId },
  });

  if (!club || club.status !== "ACTIVE") {
    return { success: false, error: "This club is not currently accepting members." };
  }

  const existing = await prisma.membership.findUnique({
    where: {
      userId_clubId: { userId: user.id, clubId },
    },
  });

  if (existing) {
    if (existing.status === "APPROVED") {
      return { success: false, error: "You are already an approved member of this club." };
    }
    if (existing.status === "PENDING") {
      return { success: false, error: "Your membership request is already pending review." };
    }
    // If previously rejected, allow re-requesting
    await prisma.membership.update({
      where: { id: existing.id },
      data: { status: "PENDING" },
    });
  } else {
    await prisma.membership.create({
      data: {
        userId: user.id,
        clubId,
        role: "MEMBER",
        status: "PENDING",
      },
    });
  }

  // Notify club admins
  const admins = await prisma.membership.findMany({
    where: { clubId, status: "APPROVED", role: { in: ["LEAD", "COORDINATOR"] } },
    select: { userId: true },
  });

  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.userId,
        title: "New Membership Request",
        body: `${user.name} requested to join ${club.name}.`,
        link: `/clubs/${club.slug}/members`,
      })),
    });
  }

  revalidatePath(`/clubs/${club.slug}`);
  revalidatePath("/my-clubs");
  return { success: true, data: undefined };
}

export async function leaveClub(clubId: string): Promise<ActionResult> {
  const user = await requireSession();

  const membership = await prisma.membership.findUnique({
    where: {
      userId_clubId: { userId: user.id, clubId },
    },
    include: { club: true },
  });

  if (!membership) {
    return { success: false, error: "You are not a member of this club." };
  }

  // Don't allow sole LEAD to leave without transferring leadership
  if (membership.role === "LEAD") {
    const otherLeads = await prisma.membership.count({
      where: {
        clubId,
        role: "LEAD",
        status: "APPROVED",
        userId: { not: user.id },
      },
    });

    if (otherLeads === 0) {
      return {
        success: false,
        error: "You are the sole lead of this club. Promote another member before leaving.",
      };
    }
  }

  await prisma.membership.delete({
    where: { id: membership.id },
  });

  revalidatePath(`/clubs/${membership.club.slug}`);
  revalidatePath("/my-clubs");
  return { success: true, data: undefined };
}

export async function updateMemberStatus(
  membershipId: string,
  newStatus: MemberStatus
): Promise<ActionResult> {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { club: true, user: true },
  });

  if (!membership) {
    return { success: false, error: "Membership record not found." };
  }

  await requireClubAdmin(membership.clubId);

  await prisma.membership.update({
    where: { id: membershipId },
    data: { status: newStatus },
  });

  // Notify student of approval/rejection
  await prisma.notification.create({
    data: {
      userId: membership.userId,
      title: newStatus === "APPROVED" ? "Membership Approved!" : "Membership Update",
      body:
        newStatus === "APPROVED"
          ? `Your join request for "${membership.club.name}" was approved.`
          : `Your join request for "${membership.club.name}" was not accepted.`,
      link: `/clubs/${membership.club.slug}`,
    },
  });

  revalidatePath(`/clubs/${membership.club.slug}/members`);
  return { success: true, data: undefined };
}

export async function updateMemberRole(
  membershipId: string,
  newRole: MemberRole
): Promise<ActionResult> {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { club: true, user: true },
  });

  if (!membership) {
    return { success: false, error: "Membership not found." };
  }

  await requireClubAdmin(membership.clubId);

  await prisma.$transaction(async (tx) => {
    await tx.membership.update({
      where: { id: membershipId },
      data: { role: newRole },
    });

    // If promoted to LEAD or COORDINATOR and currently STUDENT, elevate to CLUB_ADMIN role
    if (["LEAD", "COORDINATOR"].includes(newRole) && membership.user.role === "STUDENT") {
      await tx.user.update({
        where: { id: membership.userId },
        data: { role: "CLUB_ADMIN" },
      });
    }

    // Notify member of their promotion
    await tx.notification.create({
      data: {
        userId: membership.userId,
        title: "Club Role Updated",
        body: `Your role in "${membership.club.name}" has been updated to ${newRole}.`,
        link: `/clubs/${membership.club.slug}`,
      },
    });
  });

  revalidatePath(`/clubs/${membership.club.slug}/members`);
  return { success: true, data: undefined };
}

export async function removeMember(membershipId: string): Promise<ActionResult> {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId },
    include: { club: true },
  });

  if (!membership) {
    return { success: false, error: "Membership not found." };
  }

  await requireClubAdmin(membership.clubId);

  await prisma.membership.delete({
    where: { id: membershipId },
  });

  // Notify removed member
  await prisma.notification.create({
    data: {
      userId: membership.userId,
      title: "Club Membership Ended",
      body: `You have been removed from "${membership.club.name}".`,
      link: "/clubs",
    },
  });

  revalidatePath(`/clubs/${membership.club.slug}/members`);
  return { success: true, data: undefined };
}
