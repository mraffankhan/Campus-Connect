import type {
  User,
  Club,
  Membership,
  Event,
  Registration,
  Attendance,
  Announcement,
  Notification,
} from "@prisma/client";

// ─── Re-exports for convenience ─────────────────────────
export type {
  User,
  Club,
  Membership,
  Event,
  Registration,
  Attendance,
  Announcement,
  Notification,
};

// ─── Result pattern for server actions ──────────────────
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Extended types with relations ──────────────────────
export type ClubWithCounts = Club & {
  _count: {
    memberships: number;
    events: number;
  };
};

export type ClubDetail = Club & {
  memberships: (Membership & { user: Pick<User, "id" | "name" | "email" | "avatarUrl"> })[];
  events: Event[];
  announcements: (Announcement & { author: Pick<User, "id" | "name" | "avatarUrl"> })[];
  _count: {
    memberships: number;
    events: number;
  };
};

export type EventWithClub = Event & {
  club: Pick<Club, "id" | "name" | "slug" | "logoUrl">;
  _count?: {
    registrations: number;
    attendances: number;
  };
};

export type EventDetail = Event & {
  club: Club;
  registrations: (Registration & { user: Pick<User, "id" | "name" | "email" | "avatarUrl"> })[];
  _count: {
    registrations: number;
    attendances: number;
  };
};

export type AnnouncementWithAuthor = Announcement & {
  author: Pick<User, "id" | "name" | "avatarUrl">;
  club?: Pick<Club, "id" | "name" | "slug"> | null;
};

export type MembershipWithUser = Membership & {
  user: Pick<User, "id" | "name" | "email" | "avatarUrl" | "department" | "year">;
};

export type MembershipWithClub = Membership & {
  club: Pick<Club, "id" | "name" | "slug" | "logoUrl" | "category">;
};

export type RegistrationWithEvent = Registration & {
  event: EventWithClub;
};

// ─── Pagination ─────────────────────────────────────────
export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ─── Dashboard Stats ────────────────────────────────────
export type DashboardStats = {
  totalClubs: number;
  totalEvents: number;
  totalUsers: number;
  upcomingEvents: number;
};

export type ClubAdminStats = {
  totalMembers: number;
  pendingMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  averageAttendance: number;
};
