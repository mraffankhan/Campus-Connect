# CampusConnect – College Club Portal

CampusConnect is a full-stack campus organization portal built for universities. It connects students to student chapters and interest societies, streamlines event registrations with capacity and waitlist management, issues signed QR code admission tickets, provides live camera scanning for club check-in desks, and offers multi-tier role dashboards for students, club coordinators, and university administrators.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Route Handlers) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict typing across schema & client) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) / [Base UI](https://base-ui.com/) |
| **Theme** | Indigo/Violet palette with dark mode support (`next-themes`) |
| **Database** | [Supabase](https://supabase.com/) PostgreSQL + [Prisma ORM](https://www.prisma.io/) |
| **Auth** | Supabase Auth (Email & Password, college email domain restriction) |
| **Validation** | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |
| **QR System** | `qrcode` (Ticket generation) + `html5-qrcode` (Live camera check-in) + `jsonwebtoken` (Tamper-proof tickets) |
| **Testing** | Node.js native test runner (`node:test`, `ts-node`) |
| **Deployment Target** | [Vercel](https://vercel.com/) |

---

## 🏛️ Roles and Permissions

| Role | Permissions & Access Scope |
|---|---|
| **STUDENT** | Browse active clubs, request to join clubs, register for public & member-only events, view own digital QR passes, view own attendance percentage, receive in-app notifications, and view announcement feeds. |
| **CLUB_ADMIN** | Manage only their assigned club(s): review & approve/reject membership requests, promote/demote member roles (`MEMBER`, `COORDINATOR`, `LEAD`), create & cancel events, launch live QR camera scanner & manual attendance desk, export CSV attendance sheets, and post club announcements. |
| **SUPER_ADMIN** | Approve or suspend club creation applications, manage all campus user roles, post college-wide broadcasts to all enrolled students, and view campus-wide analytics (turnout rates, active clubs, registrations). |

*Permissions are enforced on 3 layers: Edge Middleware (`src/middleware.ts`), Server Action guards (`requireRole`, `requireClubAdmin`, `requireClubMember`), and database foreign-key constraints.*

---

## 📊 Database Schema (Prisma)

```mermaid
erDiagram
    User ||--o{ Membership : "has"
    User ||--o{ Registration : "registers"
    User ||--o{ Attendance : "attends"
    User ||--o{ Announcement : "authors"
    User ||--o{ Notification : "receives"
    Club ||--o{ Membership : "has"
    Club ||--o{ Event : "hosts"
    Club ||--o{ Announcement : "has"
    Event ||--o{ Registration : "has"
    Event ||--o{ Attendance : "tracks"

    User {
        String id PK
        String name
        String email UK
        Role role "STUDENT | CLUB_ADMIN | SUPER_ADMIN"
        String department
        Int year
        String avatarUrl
        DateTime createdAt
    }

    Club {
        String id PK
        String name
        String slug UK
        String description
        String category
        String logoUrl
        ClubStatus status "PENDING | ACTIVE | SUSPENDED"
        DateTime createdAt
    }

    Membership {
        String id PK
        String userId FK
        String clubId FK
        MemberRole role "MEMBER | COORDINATOR | LEAD"
        MemberStatus status "PENDING | APPROVED | REJECTED"
        DateTime joinedAt
    }

    Event {
        String id PK
        String clubId FK
        String title
        String description
        String venue
        DateTime startsAt
        DateTime endsAt
        Int capacity
        DateTime registrationDeadline
        EventStatus status "DRAFT | PUBLISHED | CANCELLED | COMPLETED"
        Boolean isMembersOnly
        String bannerUrl
    }

    Registration {
        String id PK
        String eventId FK
        String userId FK
        RegistrationStatus status "CONFIRMED | WAITLISTED | CANCELLED"
        DateTime registeredAt
    }

    Attendance {
        String id PK
        String eventId FK
        String userId FK
        DateTime checkedInAt
        CheckInMethod method "QR | MANUAL"
        String markedBy
    }

    Announcement {
        String id PK
        String clubId FK "nullable = college-wide"
        String authorId FK
        String title
        String body
        Boolean pinned
        DateTime createdAt
    }

    Notification {
        String id PK
        String userId FK
        String title
        String body
        String link
        Boolean read
        DateTime createdAt
    }
```

---

## ✨ Feature Highlights

### 1. Club Management & Memberships
- **Searchable Directory**: Browse student chapters by category (Technology, Arts & Culture, Sports, etc.) and search keywords.
- **Club Request Flow**: Students submit proposals to create a club (`/clubs/new`). New clubs remain `PENDING` until a Super Admin approves them (`/admin/clubs`).
- **Join & Review Workflow**: Students submit join requests; club leads and coordinators approve or reject applicants, assign coordinator roles, or remove members (`/clubs/[slug]/members`).
- **My Clubs**: Dedicated student dashboard displaying active and pending memberships (`/my-clubs`).

### 2. Events, Capacity & Automatic Waitlist
- **Public & Members-Only Events**: Club admins configure capacity limits, registration deadlines, and the `isMembersOnly` flag.
- **Automated Waitlisting**: When confirmed registrations reach capacity, new registrants are placed in the FIFO waitlist.
- **Auto-Promotion on Cancellation**: When a confirmed student cancels their ticket, the oldest waitlisted student is immediately promoted to `CONFIRMED`, and an in-app alert is generated.
- **My Events**: Student dashboard displaying upcoming bookings and historical attendance record (`/my-events`).

### 3. QR Code Fast Check-In & Attendance Desk
- **Signed Digital Tickets**: Confirmed participants receive a signed, time-limited JWT pass encoded as an HD QR code (`/events/[id]/qr`).
- **Live Camera Scanner**: Club organizers launch the camera scanner (`/events/[id]/attendance`) powered by `html5-qrcode`.
- **Duplicate & Rate Protection**: Scans are verified via `/api/attendance/check-in`, checking event status, registration validity, and preventing duplicate check-ins.
- **Manual Override & CSV Export**: Check-in organizers can manually mark attendees or export the attendance roster as a `.csv` file (`/api/attendance/export`).

### 4. Announcements & Activity Notifications
- **Combined Student Feed**: College-wide official notices and club-specific announcements with pin-to-top support (`/announcements`).
- **Admin Broadcast Center**: Super Admins post campus-wide notices (`/admin/announcements`).
- **In-App Notification Inbox**: Real-time alerts for club approvals, waitlist promotions, schedule changes, and unread badges in the header bar (`/notifications`).

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- A Supabase project (PostgreSQL + Auth)

### 2. Environment Variables Configuration
Copy `.env.example` to `.env.local` and set your credentials:

```bash
cp .env.example .env.local
```

Required variables:
```ini
# Supabase Project Credentials
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database Connection (Postgres via Prisma)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# College Email Domain Restriction (Leave blank to permit any domain)
ALLOWED_EMAIL_DOMAIN="college.edu"

# QR Ticket Security Secret (at least 32 characters)
QR_JWT_SECRET="super-secret-jwt-key-for-campus-connect-attendance-32chars"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Seeding
Push the Prisma schema to your database and generate types:
```bash
npx prisma db push
npx prisma generate
```

Seed realistic campus demo data (1 Super Admin, 3 Clubs with Admins, 20 Students, 10 Events, registrations, and announcements):
```bash
npm run seed
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

Run the built-in test suite verifying role middleware permissions, waitlist capacity promotion logic, and QR token verification:

```bash
npm test
```

Test suite coverage:
- `src/lib/auth/__tests__/permissions.test.ts` (Role guards, club admin boundaries, members-only checks)
- `src/actions/__tests__/waitlist.test.ts` (Capacity limits, waitlist ordering, automatic cancellation promotion)
- `src/lib/qr/__tests__/qr.test.ts` (JWT QR signature generation, expiration, tamper detection)

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Set the Environment Variables listed in `.env.example`.
4. Deploy! Next.js App Router and Prisma generate will automatically build and deploy the edge-ready application.
