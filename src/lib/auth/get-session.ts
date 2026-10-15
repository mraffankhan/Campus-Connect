import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export type SessionUser = User;

/**
 * Gets the current authenticated user from Supabase and resolves
 * the corresponding Prisma User record.
 * Returns null if not authenticated or user record not found.
 */
export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });

  return user;
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
