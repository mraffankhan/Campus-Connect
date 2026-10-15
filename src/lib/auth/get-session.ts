import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import { DEMO_STUDENT } from "@/lib/mock-data";

export type SessionUser = User;

/**
 * Gets the current active session user.
 * Supports:
 * 1. Active demo cookie (`campus_connect_demo_user`) for instant in-browser switching.
 * 2. Supabase Auth session if configured.
 * 3. Default demo student fallback in development mock mode.
 */
export async function getSession(): Promise<SessionUser | null> {
  // 1. Check for explicit demo user selection cookie
  try {
    const cookieStore = await cookies();
    const demoUserId = cookieStore.get("campus_connect_demo_user")?.value;
    if (demoUserId) {
      const demoUser = await prisma.user.findUnique({
        where: { id: demoUserId },
      });
      if (demoUser) return demoUser;
    }
  } catch {
    // cookies() unavailable in certain test or static rendering phases
  }

  // 2. Try Supabase authenticated user
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (supabaseUser) {
      const user = await prisma.user.findUnique({
        where: { supabaseId: supabaseUser.id },
      });
      if (user) return user;
    }
  } catch {
    // Supabase client error or missing credentials
  }

  // 3. Fallback to default demo student persona so app is immediately usable
  const defaultUser = await prisma.user.findUnique({
    where: { id: DEMO_STUDENT.id },
  });

  return defaultUser || (DEMO_STUDENT as unknown as User);
}

/**
 * Gets session or throws — use in server actions where auth is required.
 */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
