"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/require-role";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";

export async function updateUserRole(userId: string, newRole: Role): Promise<ActionResult> {
  const currentAdmin = await requireRole("SUPER_ADMIN");

  // Prevent super admin from accidentally demoting themselves if they are the only super admin
  if (currentAdmin.id === userId && newRole !== "SUPER_ADMIN") {
    const otherSuperAdmins = await prisma.user.count({
      where: { role: "SUPER_ADMIN", id: { not: userId } },
    });
    if (otherSuperAdmins === 0) {
      return { success: false, error: "Cannot demote the only Super Admin account." };
    }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId,
        title: "Account Role Updated",
        body: `Your portal role has been changed to ${newRole.replace("_", " ")}.`,
        link: "/home",
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update user role." };
  }
}
