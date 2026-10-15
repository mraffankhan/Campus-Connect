"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { requireRole, requireClubAdmin } from "@/lib/auth/require-role";
import { createClubSchema, updateClubSchema, type CreateClubInput, type UpdateClubInput } from "@/schemas/club";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function requestClub(input: CreateClubInput): Promise<ActionResult<{ slug: string }>> {
  const user = await requireSession();

  const parsed = createClubSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid club data" };
  }

  const { name, description, category, logoUrl } = parsed.data;
  let baseSlug = slugify(name);
  if (!baseSlug) baseSlug = "club";

  // Ensure unique slug
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.club.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  try {
    const club = await prisma.$transaction(async (tx) => {
      const newClub = await tx.club.create({
        data: {
          name,
          slug,
          description,
          category,
          logoUrl: logoUrl || null,
          status: "PENDING", // Requires super admin approval
        },
      });

      // Add requester as LEAD of this club
      await tx.membership.create({
        data: {
          userId: user.id,
          clubId: newClub.id,
          role: "LEAD",
          status: "PENDING",
        },
      });

      // Notify super admins about pending club request
      const superAdmins = await tx.user.findMany({
        where: { role: "SUPER_ADMIN" },
        select: { id: true },
      });

      if (superAdmins.length > 0) {
        await tx.notification.createMany({
          data: superAdmins.map((admin) => ({
            userId: admin.id,
            title: "New Club Approval Request",
            body: `${user.name} submitted a request to create "${name}".`,
            link: "/admin/clubs",
          })),
        });
      }

      return newClub;
    });

    revalidatePath("/clubs");
    revalidatePath("/admin/clubs");
    return { success: true, data: { slug: club.slug } };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to submit club creation request." };
  }
}

export async function approveClub(clubId: string): Promise<ActionResult> {
  const admin = await requireRole("SUPER_ADMIN");

  try {
    const club = await prisma.$transaction(async (tx) => {
      const updated = await tx.club.update({
        where: { id: clubId },
        data: { status: "ACTIVE" },
      });

      // Approve all lead memberships for this club and promote user role if student
      const leadMemberships = await tx.membership.findMany({
        where: { clubId, role: "LEAD" },
        include: { user: true },
      });

      for (const m of leadMemberships) {
        await tx.membership.update({
          where: { id: m.id },
          data: { status: "APPROVED" },
        });

        // If user is currently STUDENT, promote to CLUB_ADMIN
        if (m.user.role === "STUDENT") {
          await tx.user.update({
            where: { id: m.userId },
            data: { role: "CLUB_ADMIN" },
          });
        }

        // Notify club founder
        await tx.notification.create({
          data: {
            userId: m.userId,
            title: "Club Approved!",
            body: `Congratulations! Your club "${updated.name}" has been approved and is now active.`,
            link: `/clubs/${updated.slug}`,
          },
        });
      }

      return updated;
    });

    revalidatePath("/clubs");
    revalidatePath(`/clubs/${club.slug}`);
    revalidatePath("/admin/clubs");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve club." };
  }
}

export async function suspendClub(clubId: string, suspend: boolean): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");

  try {
    const club = await prisma.club.update({
      where: { id: clubId },
      data: { status: suspend ? "SUSPENDED" : "ACTIVE" },
    });

    // Notify club leads
    const leads = await prisma.membership.findMany({
      where: { clubId, role: "LEAD" },
      select: { userId: true },
    });

    if (leads.length > 0) {
      await prisma.notification.createMany({
        data: leads.map((l) => ({
          userId: l.userId,
          title: suspend ? "Club Suspended" : "Club Reactivated",
          body: suspend
            ? `Your club "${club.name}" has been suspended by administration.`
            : `Your club "${club.name}" is now active again.`,
          link: `/clubs/${club.slug}`,
        })),
      });
    }

    revalidatePath("/clubs");
    revalidatePath(`/clubs/${club.slug}`);
    revalidatePath("/admin/clubs");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update club status." };
  }
}

export async function updateClub(clubId: string, input: UpdateClubInput): Promise<ActionResult> {
  await requireClubAdmin(clubId);

  const parsed = updateClubSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid update data" };
  }

  try {
    const updated = await prisma.club.update({
      where: { id: clubId },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.description && { description: parsed.data.description }),
        ...(parsed.data.category && { category: parsed.data.category }),
        ...(parsed.data.logoUrl !== undefined && { logoUrl: parsed.data.logoUrl || null }),
      },
    });

    revalidatePath(`/clubs/${updated.slug}`);
    revalidatePath("/clubs");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update club details." };
  }
}
