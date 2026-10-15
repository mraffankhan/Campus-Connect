"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import type { ActionResult } from "@/types";
import { revalidatePath } from "next/cache";

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const user = await requireSession();

  try {
    await prisma.notification.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: { read: true },
    });

    revalidatePath("/notifications");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update notification" };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const user = await requireSession();

  try {
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: { read: true },
    });

    revalidatePath("/notifications");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to mark all as read" };
  }
}

export async function clearReadNotifications(): Promise<ActionResult> {
  const user = await requireSession();

  try {
    await prisma.notification.deleteMany({
      where: {
        userId: user.id,
        read: true,
      },
    });

    revalidatePath("/notifications");
    return { success: true, data: undefined };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to clear notifications" };
  }
}
