import { describe, it } from "node:test";
import assert from "node:assert/strict";

type Role = "STUDENT" | "CLUB_ADMIN" | "SUPER_ADMIN";
type MemberRole = "MEMBER" | "COORDINATOR" | "LEAD";
type MemberStatus = "PENDING" | "APPROVED" | "REJECTED";

interface MockUser {
  id: string;
  role: Role;
}

interface MockMembership {
  userId: string;
  clubId: string;
  role: MemberRole;
  status: MemberStatus;
}

function checkRolePermission(user: MockUser, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(user.role);
}

function checkClubAdminPermission(
  user: MockUser,
  clubId: string,
  memberships: MockMembership[]
): boolean {
  if (user.role === "SUPER_ADMIN") return true;

  const m = memberships.find(
    (item) => item.userId === user.id && item.clubId === clubId
  );

  return !!m && m.status === "APPROVED" && (m.role === "LEAD" || m.role === "COORDINATOR");
}

function canRegisterForMembersOnlyEvent(
  user: MockUser,
  eventClubId: string,
  memberships: MockMembership[]
): boolean {
  if (user.role === "SUPER_ADMIN") return true;

  const m = memberships.find(
    (item) => item.userId === user.id && item.clubId === eventClubId
  );

  return !!m && m.status === "APPROVED";
}

describe("Role and Permission Guards", () => {
  const superAdmin: MockUser = { id: "admin-1", role: "SUPER_ADMIN" };
  const clubAdmin: MockUser = { id: "club-admin-1", role: "CLUB_ADMIN" };
  const student: MockUser = { id: "student-1", role: "STUDENT" };

  const memberships: MockMembership[] = [
    { userId: "club-admin-1", clubId: "club-acm", role: "LEAD", status: "APPROVED" },
    { userId: "student-1", clubId: "club-acm", role: "MEMBER", status: "APPROVED" },
    { userId: "student-1", clubId: "club-robotics", role: "MEMBER", status: "PENDING" },
  ];

  it("should enforce SUPER_ADMIN-only routes", () => {
    assert.strictEqual(checkRolePermission(superAdmin, ["SUPER_ADMIN"]), true);
    assert.strictEqual(checkRolePermission(clubAdmin, ["SUPER_ADMIN"]), false);
    assert.strictEqual(checkRolePermission(student, ["SUPER_ADMIN"]), false);
  });

  it("should restrict club admin actions to their own approved club", () => {
    // Club admin can manage club-acm
    assert.strictEqual(checkClubAdminPermission(clubAdmin, "club-acm", memberships), true);
    // Club admin CANNOT manage other clubs (e.g. robotics)
    assert.strictEqual(checkClubAdminPermission(clubAdmin, "club-robotics", memberships), false);
    // Regular student cannot manage club-acm
    assert.strictEqual(checkClubAdminPermission(student, "club-acm", memberships), false);
    // Super admin can manage ANY club
    assert.strictEqual(checkClubAdminPermission(superAdmin, "club-acm", memberships), true);
    assert.strictEqual(checkClubAdminPermission(superAdmin, "club-robotics", memberships), true);
  });

  it("should enforce members-only registration checks", () => {
    // Student is approved member of ACM -> can register
    assert.strictEqual(canRegisterForMembersOnlyEvent(student, "club-acm", memberships), true);
    // Student is PENDING in robotics -> CANNOT register
    assert.strictEqual(canRegisterForMembersOnlyEvent(student, "club-robotics", memberships), false);
    // Super admin can register for any members-only event
    assert.strictEqual(canRegisterForMembersOnlyEvent(superAdmin, "club-acm", memberships), true);
  });
});
