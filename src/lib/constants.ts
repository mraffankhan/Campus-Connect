export const APP_NAME = "CampusConnect";

export const CLUB_CATEGORIES = [
  "Technology",
  "Arts & Culture",
  "Sports & Fitness",
  "Science & Research",
  "Social & Community",
  "Business & Entrepreneurship",
  "Music & Performance",
  "Literature & Debate",
  "Environment & Sustainability",
  "Media & Journalism",
] as const;

export const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Electronics & Communication",
  "Chemical Engineering",
  "Biotechnology",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Business Administration",
  "Humanities",
] as const;

export const YEARS = [1, 2, 3, 4, 5] as const;

export const ITEMS_PER_PAGE = 12;

export const NAV_ITEMS = {
  student: [
    { label: "Home", href: "/home", icon: "Home" },
    { label: "Clubs", href: "/clubs", icon: "Users" },
    { label: "Events", href: "/events", icon: "Calendar" },
    { label: "My Clubs", href: "/my-clubs", icon: "Heart" },
    { label: "My Events", href: "/my-events", icon: "CalendarCheck" },
    { label: "Announcements", href: "/announcements", icon: "Megaphone" },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
    { label: "Manage Clubs", href: "/admin/clubs", icon: "Building2" },
    { label: "Manage Users", href: "/admin/users", icon: "UserCog" },
    { label: "Announcements", href: "/admin/announcements", icon: "Megaphone" },
  ],
} as const;
