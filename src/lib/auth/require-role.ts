import { Role } from "@prisma/client";
import { requireSession, type SessionUser } from "./get-session";
import { prisma } from "@/lib/prisma";

/**
 * Require a minimum role to proceed. Throws if the user's role
 * doesn't meet the requirement.
 */
export async function requireRole(
  ...allowedRoles: Role[]
): Promise<SessionUser> {
  const user = await requireSession();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: insufficient permissions");
  }

  return user;
}

/**
 * Check if a user is a club admin (LEAD or COORDINATOR) for a specific club.
 * SUPER_ADMIN always passes.
 */
export async function requireClubAdmin(clubId: string): Promise<SessionUser> {
  const user = await requireSession();

  if (user.role === Role.SUPER_ADMIN) return user;

  const membership = await prisma.membership.findUnique({
    where: {
      userId_clubId: { userId: user.id, clubId },
    },
  });

  if (
    !membership ||
    membership.status !== "APPROVED" ||
    !["LEAD", "COORDINATOR"].includes(membership.role)
  ) {
    throw new Error("Forbidden: not a club admin");
  }

  return user;
}

/**
 * Check if a user is an approved member of a specific club.
 */
export async function requireClubMember(clubId: string): Promise<SessionUser> {
  const user = await requireSession();

  if (user.role === Role.SUPER_ADMIN) return user;

  const membership = await prisma.membership.findUnique({
    where: {
      userId_clubId: { userId: user.id, clubId },
    },
  });

  if (!membership || membership.status !== "APPROVED") {
    throw new Error("Forbidden: not a club member");
  }

  return user;
}
