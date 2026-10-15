import { Role, ClubStatus, MemberRole, MemberStatus, EventStatus, RegistrationStatus, CheckInMethod } from "@prisma/client";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  year: number | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  supabaseId: string | null;
}

export interface MockClub {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logoUrl: string | null;
  status: ClubStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockMembership {
  id: string;
  userId: string;
  clubId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
}

export interface MockEvent {
  id: string;
  clubId: string;
  title: string;
  description: string | null;
  venue: string | null;
  startsAt: Date;
  endsAt: Date;
  capacity: number | null;
  registrationDeadline: Date | null;
  status: EventStatus;
  isMembersOnly: boolean;
  bannerUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: RegistrationStatus;
  registeredAt: Date;
}

export interface MockAttendance {
  id: string;
  eventId: string;
  userId: string;
  checkedInAt: Date;
  method: CheckInMethod;
  markedBy: string | null;
}

export interface MockAnnouncement {
  id: string;
  clubId: string | null;
  authorId: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MockNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
}

// ─── Preset Demo Users ─────────────────────────────────────────────────────────

export const DEMO_SUPER_ADMIN: MockUser = {
  id: "user-super-admin",
  name: "Dr. Evelyn Vance",
  email: "dean@college.edu",
  role: "SUPER_ADMIN",
  department: "Computer Science",
  year: 5,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  supabaseId: "sb-super-admin",
};

export const DEMO_CLUB_ADMIN: MockUser = {
  id: "user-club-admin-1",
  name: "Sarah Chen",
  email: "sarah.chen@college.edu",
  role: "CLUB_ADMIN",
  department: "Computer Science",
  year: 4,
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  createdAt: new Date("2026-01-05"),
  updatedAt: new Date("2026-01-05"),
  supabaseId: "sb-club-admin-1",
};

export const DEMO_STUDENT: MockUser = {
  id: "user-student-1",
  name: "Liam Johnson",
  email: "liam.j@college.edu",
  role: "STUDENT",
  department: "Computer Science",
  year: 1,
  avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
  createdAt: new Date("2026-01-10"),
  updatedAt: new Date("2026-01-10"),
  supabaseId: "sb-student-1",
};

export const ALL_DEMO_USERS: MockUser[] = [
  DEMO_SUPER_ADMIN,
  DEMO_CLUB_ADMIN,
  {
    id: "user-club-admin-2",
    name: "Marcus Miller",
    email: "marcus.miller@college.edu",
    role: "CLUB_ADMIN",
    department: "Electrical Engineering",
    year: 3,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-05"),
    supabaseId: "sb-club-admin-2",
  },
  {
    id: "user-club-admin-3",
    name: "Priya Sharma",
    email: "priya.sharma@college.edu",
    role: "CLUB_ADMIN",
    department: "Information Technology",
    year: 4,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-05"),
    supabaseId: "sb-club-admin-3",
  },
  DEMO_STUDENT,
  {
    id: "user-student-2",
    name: "Emma Watson",
    email: "emma.w@college.edu",
    role: "STUDENT",
    department: "Computer Science",
    year: 2,
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    createdAt: new Date("2026-01-11"),
    updatedAt: new Date("2026-01-11"),
    supabaseId: "sb-student-2",
  },
  {
    id: "user-student-3",
    name: "Noah Williams",
    email: "noah.w@college.edu",
    role: "STUDENT",
    department: "Electrical Engineering",
    year: 1,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-01-12"),
    supabaseId: "sb-student-3",
  },
  {
    id: "user-student-4",
    name: "Olivia Brown",
    email: "olivia.b@college.edu",
    role: "STUDENT",
    department: "Mechanical Engineering",
    year: 3,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    createdAt: new Date("2026-01-13"),
    updatedAt: new Date("2026-01-13"),
    supabaseId: "sb-student-4",
  },
  {
    id: "user-student-5",
    name: "James Jones",
    email: "james.j@college.edu",
    role: "STUDENT",
    department: "Information Technology",
    year: 2,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    createdAt: new Date("2026-01-14"),
    updatedAt: new Date("2026-01-14"),
    supabaseId: "sb-student-5",
  },
  {
    id: "user-student-6",
    name: "Sophia Garcia",
    email: "sophia.g@college.edu",
    role: "STUDENT",
    department: "Computer Science",
    year: 4,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
    supabaseId: "sb-student-6",
  },
  {
    id: "user-student-7",
    name: "Benjamin Davis",
    email: "benjamin.d@college.edu",
    role: "STUDENT",
    department: "Electrical Engineering",
    year: 1,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
    supabaseId: "sb-student-7",
  },
  {
    id: "user-student-8",
    name: "Isabella Martinez",
    email: "isabella.m@college.edu",
    role: "STUDENT",
    department: "Mechanical Engineering",
    year: 3,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    createdAt: new Date("2026-01-16"),
    updatedAt: new Date("2026-01-16"),
    supabaseId: "sb-student-8",
  },
  {
    id: "user-student-9",
    name: "Mason Rodriguez",
    email: "mason.r@college.edu",
    role: "STUDENT",
    department: "Information Technology",
    year: 2,
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
    createdAt: new Date("2026-01-16"),
    updatedAt: new Date("2026-01-16"),
    supabaseId: "sb-student-9",
  },
  {
    id: "user-student-10",
    name: "Mia Hernandez",
    email: "mia.h@college.edu",
    role: "STUDENT",
    department: "Civil Engineering",
    year: 2,
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    createdAt: new Date("2026-01-17"),
    updatedAt: new Date("2026-01-17"),
    supabaseId: "sb-student-10",
  },
  {
    id: "user-student-11",
    name: "Ethan Lopez",
    email: "ethan.l@college.edu",
    role: "STUDENT",
    department: "Computer Science",
    year: 4,
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    createdAt: new Date("2026-01-17"),
    updatedAt: new Date("2026-01-17"),
    supabaseId: "sb-student-11",
  },
  {
    id: "user-student-12",
    name: "Harper Gonzalez",
    email: "harper.g@college.edu",
    role: "STUDENT",
    department: "Electrical Engineering",
    year: 1,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    createdAt: new Date("2026-01-18"),
    updatedAt: new Date("2026-01-18"),
    supabaseId: "sb-student-12",
  },
  {
    id: "user-student-13",
    name: "Alexander Wilson",
    email: "alex.w@college.edu",
    role: "STUDENT",
    department: "Mechanical Engineering",
    year: 3,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    createdAt: new Date("2026-01-18"),
    updatedAt: new Date("2026-01-18"),
    supabaseId: "sb-student-13",
  },
  {
    id: "user-student-14",
    name: "Evelyn Anderson",
    email: "evelyn.a@college.edu",
    role: "STUDENT",
    department: "Information Technology",
    year: 2,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    createdAt: new Date("2026-01-19"),
    updatedAt: new Date("2026-01-19"),
    supabaseId: "sb-student-14",
  },
  {
    id: "user-student-15",
    name: "Daniel Thomas",
    email: "daniel.t@college.edu",
    role: "STUDENT",
    department: "Civil Engineering",
    year: 1,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    createdAt: new Date("2026-01-19"),
    updatedAt: new Date("2026-01-19"),
    supabaseId: "sb-student-15",
  },
  {
    id: "user-student-16",
    name: "Abigail Taylor",
    email: "abigail.t@college.edu",
    role: "STUDENT",
    department: "Computer Science",
    year: 3,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-01-20"),
    supabaseId: "sb-student-16",
  },
  {
    id: "user-student-17",
    name: "Henry Moore",
    email: "henry.m@college.edu",
    role: "STUDENT",
    department: "Electrical Engineering",
    year: 4,
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-01-20"),
    supabaseId: "sb-student-17",
  },
  {
    id: "user-student-18",
    name: "Emily Jackson",
    email: "emily.j@college.edu",
    role: "STUDENT",
    department: "Mechanical Engineering",
    year: 2,
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    createdAt: new Date("2026-01-21"),
    updatedAt: new Date("2026-01-21"),
    supabaseId: "sb-student-18",
  },
  {
    id: "user-student-19",
    name: "Lucas Martin",
    email: "lucas.m@college.edu",
    role: "STUDENT",
    department: "Information Technology",
    year: 1,
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
    createdAt: new Date("2026-01-21"),
    updatedAt: new Date("2026-01-21"),
    supabaseId: "sb-student-19",
  },
  {
    id: "user-student-20",
    name: "Charlotte Lee",
    email: "charlotte.l@college.edu",
    role: "STUDENT",
    department: "Civil Engineering",
    year: 3,
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    createdAt: new Date("2026-01-22"),
    updatedAt: new Date("2026-01-22"),
    supabaseId: "sb-student-20",
  },
];

// ─── Preset Demo Clubs ──────────────────────────────────────────────────────────

export const INITIAL_CLUBS: MockClub[] = [
  {
    id: "club-1",
    name: "ACM Student Chapter",
    slug: "acm-student-chapter",
    description: "Dedicated to advancing computing as a science and profession. We organize hackathons, competitive programming, guest lectures from top tech engineers, and technical workshops.",
    category: "Technology",
    logoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200",
    status: "ACTIVE",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-15"),
  },
  {
    id: "club-2",
    name: "Robotics & AI Society",
    slug: "robotics-ai-society",
    description: "Building autonomous mobile robots, fighting in RoboWars, and exploring machine learning algorithms with embedded microcontrollers.",
    category: "Technology",
    logoUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200",
    status: "ACTIVE",
    createdAt: new Date("2026-01-16"),
    updatedAt: new Date("2026-01-16"),
  },
  {
    id: "club-3",
    name: "Fine Arts & Design Collective",
    slug: "fine-arts-design",
    description: "A vibrant home for campus painters, graphic illustrators, UI/UX designers, and photography enthusiasts. Regular workshops and art fairs.",
    category: "Arts & Culture",
    logoUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200",
    status: "ACTIVE",
    createdAt: new Date("2026-01-17"),
    updatedAt: new Date("2026-01-17"),
  },
  {
    id: "club-4",
    name: "Cybersecurity & Ethical Hacking Guild",
    slug: "cybersecurity-guild",
    description: "Capturing flags (CTF competitions), network penetration testing, and ethical security research.",
    category: "Technology",
    logoUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200",
    status: "PENDING",
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  },
];

// ─── Preset Demo Memberships ───────────────────────────────────────────────────

export const INITIAL_MEMBERSHIPS: MockMembership[] = [
  // Club 1 (ACM): Sarah Chen (LEAD), Liam Johnson (MEMBER), Emma Watson (MEMBER)
  {
    id: "mem-1",
    userId: "user-club-admin-1",
    clubId: "club-1",
    role: "LEAD",
    status: "APPROVED",
    joinedAt: new Date("2026-01-15"),
  },
  {
    id: "mem-2",
    userId: "user-student-1", // Liam Johnson
    clubId: "club-1",
    role: "MEMBER",
    status: "APPROVED",
    joinedAt: new Date("2026-01-20"),
  },
  {
    id: "mem-3",
    userId: "user-student-2",
    clubId: "club-1",
    role: "COORDINATOR",
    status: "APPROVED",
    joinedAt: new Date("2026-01-21"),
  },
  {
    id: "mem-4",
    userId: "user-student-3",
    clubId: "club-1",
    role: "MEMBER",
    status: "PENDING",
    joinedAt: new Date("2026-02-05"),
  },

  // Club 2 (Robotics): Marcus Miller (LEAD), Liam Johnson (PENDING)
  {
    id: "mem-5",
    userId: "user-club-admin-2",
    clubId: "club-2",
    role: "LEAD",
    status: "APPROVED",
    joinedAt: new Date("2026-01-16"),
  },
  {
    id: "mem-6",
    userId: "user-student-1",
    clubId: "club-2",
    role: "MEMBER",
    status: "PENDING",
    joinedAt: new Date("2026-02-01"),
  },
  {
    id: "mem-7",
    userId: "user-student-4",
    clubId: "club-2",
    role: "MEMBER",
    status: "APPROVED",
    joinedAt: new Date("2026-01-22"),
  },

  // Club 3 (Arts): Priya Sharma (LEAD), Liam Johnson (APPROVED MEMBER)
  {
    id: "mem-8",
    userId: "user-club-admin-3",
    clubId: "club-3",
    role: "LEAD",
    status: "APPROVED",
    joinedAt: new Date("2026-01-17"),
  },
  {
    id: "mem-9",
    userId: "user-student-1",
    clubId: "club-3",
    role: "MEMBER",
    status: "APPROVED",
    joinedAt: new Date("2026-01-25"),
  },
];

// ─── Preset Demo Events ────────────────────────────────────────────────────────

const daysFromNow = (days: number, hour: number = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

export const INITIAL_EVENTS: MockEvent[] = [
  // Upcoming flagship
  {
    id: "evt-1",
    clubId: "club-1",
    title: "HackCampus 2026: 24-Hour Hackathon",
    description: "Our flagship annual hackathon! Build innovative web, AI, and mobile solutions in 24 hours. Food, swag, and industry mentors provided for all participants.",
    venue: "Main Campus Auditorium",
    startsAt: daysFromNow(3, 9),
    endsAt: daysFromNow(4, 9),
    capacity: 5, // Small capacity so waitlist can be demoed easily!
    registrationDeadline: daysFromNow(2, 23),
    status: "PUBLISHED",
    isMembersOnly: false,
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  },
  {
    id: "evt-2",
    clubId: "club-2",
    title: "AI Computer Vision Workshop",
    description: "Explore YOLO object detection and OpenCV real-time video processing pipelines running on Raspberry Pi microcontrollers.",
    venue: "Makerspace Hall 1",
    startsAt: daysFromNow(5, 14),
    endsAt: daysFromNow(5, 17),
    capacity: 35,
    registrationDeadline: daysFromNow(4, 18),
    status: "PUBLISHED",
    isMembersOnly: false,
    bannerUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    createdAt: new Date("2026-02-02"),
    updatedAt: new Date("2026-02-02"),
  },
  {
    id: "evt-3",
    clubId: "club-3",
    title: "Spring Campus Art Exhibition",
    description: "Displaying student oil paintings, sculptures, watercolor works, and interactive 3D digital installations.",
    venue: "Student Center Gallery",
    startsAt: daysFromNow(8, 11),
    endsAt: daysFromNow(8, 18),
    capacity: 100,
    registrationDeadline: daysFromNow(7, 23),
    status: "PUBLISHED",
    isMembersOnly: false,
    bannerUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
    createdAt: new Date("2026-02-03"),
    updatedAt: new Date("2026-02-03"),
  },
  {
    id: "evt-4",
    clubId: "club-1",
    title: "ACM Core Team Strategy & Hackathon Sync",
    description: "Internal coordination meeting for ACM coordinators to review hackathon prize tracks and judge invites.",
    venue: "Conference Room 4B",
    startsAt: daysFromNow(12, 17),
    endsAt: daysFromNow(12, 19),
    capacity: 20,
    registrationDeadline: daysFromNow(11, 23),
    status: "PUBLISHED",
    isMembersOnly: true, // Only approved ACM members!
    bannerUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    createdAt: new Date("2026-02-04"),
    updatedAt: new Date("2026-02-04"),
  },
  // Past events
  {
    id: "evt-5",
    clubId: "club-1",
    title: "Algorithmic Speed Coding Round",
    description: "A fast-paced competitive programming contest testing dynamic programming, graph theory, and greedy algorithms.",
    venue: "CS Lab 301",
    startsAt: daysFromNow(-15, 10),
    endsAt: daysFromNow(-15, 13),
    capacity: 30,
    registrationDeadline: daysFromNow(-16, 23),
    status: "COMPLETED",
    isMembersOnly: false,
    bannerUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-10"),
  },
  {
    id: "evt-6",
    clubId: "club-2",
    title: "Arduino & Sensor Interfacing Workshop",
    description: "Hands-on introduction to ultrasonic sensors, servo motors, and breadboard circuit design with hardware kits provided.",
    venue: "Robotics Arena B",
    startsAt: daysFromNow(-10, 14),
    endsAt: daysFromNow(-10, 17),
    capacity: 25,
    registrationDeadline: daysFromNow(-11, 23),
    status: "COMPLETED",
    isMembersOnly: false,
    bannerUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
    createdAt: new Date("2026-01-12"),
    updatedAt: new Date("2026-01-12"),
  },
];

// ─── Preset Demo Registrations ─────────────────────────────────────────────────

export const INITIAL_REGISTRATIONS: MockRegistration[] = [
  // Evt 1 (HackCampus, capacity 5):
  // User 1 (Liam) is CONFIRMED -> has QR ticket!
  {
    id: "reg-1",
    eventId: "evt-1",
    userId: "user-student-1",
    status: "CONFIRMED",
    registeredAt: new Date("2026-02-01T10:00:00"),
  },
  {
    id: "reg-2",
    eventId: "evt-1",
    userId: "user-student-2",
    status: "CONFIRMED",
    registeredAt: new Date("2026-02-01T10:05:00"),
  },
  {
    id: "reg-3",
    eventId: "evt-1",
    userId: "user-student-4",
    status: "CONFIRMED",
    registeredAt: new Date("2026-02-01T10:10:00"),
  },
  {
    id: "reg-4",
    eventId: "evt-1",
    userId: "user-student-5",
    status: "CONFIRMED",
    registeredAt: new Date("2026-02-01T10:15:00"),
  },
  // Waitlisted
  {
    id: "reg-5",
    eventId: "evt-1",
    userId: "user-student-3", // Noah Williams (Waitlisted, first in line!)
    status: "WAITLISTED",
    registeredAt: new Date("2026-02-01T10:20:00"),
  },

  // Past event: Liam attended Algorithmic Speed Coding
  {
    id: "reg-6",
    eventId: "evt-5",
    userId: "user-student-1",
    status: "CONFIRMED",
    registeredAt: new Date("2026-01-08"),
  },
];

// ─── Preset Demo Attendances ───────────────────────────────────────────────────

export const INITIAL_ATTENDANCES: MockAttendance[] = [
  {
    id: "att-1",
    eventId: "evt-5",
    userId: "user-student-1",
    checkedInAt: daysFromNow(-15, 10),
    method: "QR",
    markedBy: "Sarah Chen",
  },
  {
    id: "att-2",
    eventId: "evt-5",
    userId: "user-student-2",
    checkedInAt: daysFromNow(-15, 10),
    method: "MANUAL",
    markedBy: "Sarah Chen",
  },
];

// ─── Preset Demo Announcements ─────────────────────────────────────────────────

export const INITIAL_ANNOUNCEMENTS: MockAnnouncement[] = [
  {
    id: "ann-1",
    clubId: null, // College-wide
    authorId: "user-super-admin",
    title: "Welcome to Fall 2026 Semester & Club Portal Launch",
    body: "We are thrilled to unveil CampusConnect! All students are encouraged to explore campus clubs, register for student activities, and use digital QR check-in at official events.",
    pinned: true,
    createdAt: new Date("2026-01-20"),
    updatedAt: new Date("2026-01-20"),
  },
  {
    id: "ann-2",
    clubId: null, // College-wide
    authorId: "user-super-admin",
    title: "Annual Student Organization Funding Grants Open",
    body: "Registered club leadership can now submit semester event budget proposals to the Dean of Student Affairs before the end of the month.",
    pinned: false,
    createdAt: new Date("2026-02-01"),
    updatedAt: new Date("2026-02-01"),
  },
  {
    id: "ann-3",
    clubId: "club-1",
    authorId: "user-club-admin-1",
    title: "HackCampus 2026 Mentor Applications",
    body: "We are looking for senior students to serve as code mentors for first-year participants during HackCampus next weekend. Reach out in the ACM Discord channel!",
    pinned: true,
    createdAt: new Date("2026-02-03"),
    updatedAt: new Date("2026-02-03"),
  },
  {
    id: "ann-4",
    clubId: "club-2",
    authorId: "user-club-admin-2",
    title: "3D Printer Access in Makerspace Hall 1",
    body: "All Robotics & AI Society members now have certified access to the Bambu Lab 3D printers after 4 PM on weekdays.",
    pinned: false,
    createdAt: new Date("2026-02-04"),
    updatedAt: new Date("2026-02-04"),
  },
];

// ─── Preset Demo Notifications ─────────────────────────────────────────────────

export const INITIAL_NOTIFICATIONS: MockNotification[] = [
  {
    id: "notif-1",
    userId: "user-student-1",
    title: "Registration Confirmed!",
    body: "You are confirmed for HackCampus 2026: 24-Hour Hackathon. Access your QR pass.",
    link: "/events/evt-1/qr",
    read: false,
    createdAt: new Date("2026-02-01T10:00:00"),
  },
  {
    id: "notif-2",
    userId: "user-student-1",
    title: "Welcome to ACM Student Chapter",
    body: "Your membership application has been approved by the club lead.",
    link: "/clubs/acm-student-chapter",
    read: true,
    createdAt: new Date("2026-01-20"),
  },
  {
    id: "notif-3",
    userId: "user-club-admin-1",
    title: "New Membership Request",
    body: "Noah Williams requested to join ACM Student Chapter.",
    link: "/clubs/acm-student-chapter/members",
    read: false,
    createdAt: new Date("2026-02-05"),
  },
  {
    id: "notif-4",
    userId: "user-super-admin",
    title: "New Club Approval Request",
    body: "Marcus Miller submitted a request to create Cybersecurity & Ethical Hacking Guild.",
    link: "/admin/clubs",
    read: false,
    createdAt: new Date("2026-02-01"),
  },
];
