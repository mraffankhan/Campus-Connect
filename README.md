<div align="center">

# 🎓 CampusConnect – Modern College Club & Event Portal

**A production-ready, full-stack campus organization platform empowering universities to manage student societies, automate event registrations with FIFO waitlists, issue signed tamper-proof QR tickets, and streamline live check-ins.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Quick Start](#-quick-start) • [Interactive Demo Mode](#-instant-interactive-demo-mode) • [Architecture](#-system-architecture) • [Database Schema](#-database-schema) • [API & Workflows](#-workflows--security) • [Testing](#-automated-testing)

</div>

---

## 🌟 Overview

Universities host dozens of student organizations and hundreds of campus events each semester. Managing club memberships, venue capacities, paper sign-ins, and club communications is often fragmented across spreadsheets and chat apps.

**CampusConnect** solves this with an integrated, university-grade web platform featuring:
- **Multi-Tiered RBAC**: Distinct interfaces and security boundaries for **Students**, **Club Coordinators & Leads**, and **University Administrators (Deans)**.
- **Smart Event Ticketing**: Hard capacity caps, automatic **FIFO Waitlisting**, and instant promotion when confirmed attendees cancel.
- **Secure QR Admission**: High-definition digital passes signed cryptographically with time-bound JWT tokens.
- **Live Camera Check-In Desk**: In-browser QR code scanner powered by `html5-qrcode` with duplicate prevention and manual override capabilities.
- **Official Announcement Feed**: Club-specific announcements alongside campus-wide broadcasts with pin-to-top support.
- **Zero-Setup Interactive Demo Mode**: Instant one-click persona switcher allowing anyone to test all 3 roles immediately without configuring a database.

---

## ✨ Key Features

### 1. 🏛️ Club Directory & Lifecycle Management
- **Search & Categorization**: Discover clubs by interest category (Technology, Arts & Culture, Sports, Academic, Social Impact) with instant text search.
- **Club Creation Proposals**: Students submit proposals with descriptions and categories; proposals remain `PENDING` until reviewed and approved by University Deans.
- **Membership Approval Workflow**: Club leads review join applications, approve/reject students, and assign leadership positions (`MEMBER`, `COORDINATOR`, `LEAD`).
- **Student Club Hub**: Dedicated view (`/my-clubs`) showing joined clubs, leadership responsibilities, and pending application statuses.

### 2. 🎟️ Intelligent Event Management & Automatic Waitlisting
- **Configurable Access Rules**: Public campus events or exclusive `isMembersOnly` club workshops.
- **Capacity Enforcement**: Real-time seat tracking with registration deadlines.
- **Automated Waitlist Engine**: Once capacity is reached, new registrants are queued in a First-In, First-Out (FIFO) waitlist.
- **Instant Auto-Promotion**: When a registered attendee cancels, the next waitlisted student is automatically promoted to `CONFIRMED` and receives an in-app alert.

### 3. 📱 Signed QR Passes & Live Scanner Check-In Desk
- **Cryptographically Signed QR Tickets**: Passes encode a tamper-proof JWT token signed with an HMAC secret (`/events/[id]/qr`), verifying student identity and registration validity.
- **Browser-Based Scanner**: Organizers turn any smartphone, tablet, or laptop camera into an admission scanner (`/events/[id]/attendance`).
- **Anti-Fraud & Replay Protection**: Detects duplicate scans, expired events, and invalid tickets in real time.
- **Manual Check-In & Export**: Organizers can search and manually mark attendees, plus download timestamped `.csv` attendance rosters (`/api/attendance/export`).

### 4. 📢 Broadcasts, Announcements & Notification Hub
- **Multi-Level Feeds**: Pinned college-wide administrative alerts alongside club-specific feeds.
- **Notification Inbox**: Instant notifications for ticket confirmations, waitlist promotions, club approval decisions, and event schedule adjustments.
- **Email Domain Verification**: Restricted student onboarding enforcing official institutional domains (e.g. `@college.edu`).

---

## ⚡ Instant Interactive Demo Mode

CampusConnect features a built-in **In-Memory Demo Mode with Zero External Dependencies**. You can launch and test all features without spinning up Supabase or PostgreSQL!

### Switch Personas in One Click
Use the floating **Persona Switcher** in the navigation bar to jump between three pre-configured campus roles:

| Persona | Name | Role & Scope | What You Can Test |
|---|---|---|---|
| 🎓 **Student** | Liam Johnson | `STUDENT` (Freshman, CS) | Browse clubs, request membership, register for events, view personal QR passes, cancel bookings |
| 🛠️ **Club Lead** | Sarah Chen | `CLUB_ADMIN` (ACM President) | Review member applications, create new events, launch camera QR scanner, export attendance CSV |
| 🛡️ **Dean / Admin** | Dr. Evelyn Vance | `SUPER_ADMIN` (Dean of Students) | Approve/reject pending club proposals, post campus broadcasts, view system-wide metrics |

> **Note**: In demo mode, all mutations (creating events, approving members, check-ins) execute in an active in-memory session. When Supabase & PostgreSQL credentials are provided, CampusConnect seamlessly switches to production database operations.

---

## 🛠️ Tech Stack & Architecture

### Core Technologies

| Layer | Technology | Details |
|---|---|---|
| **Framework** | [Next.js 16.4](https://nextjs.org/) | App Router, Server Actions, Route Handlers, Turbopack |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Strict type safety across client, server, and schemas |
| **UI & Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | Modern design system, accessible components, Radix/Base UI |
| **Theme** | [next-themes](https://github.com/pacocoursey/next-themes) | System-aware Dark & Light mode with vibrant Indigo accents |
| **Database & ORM** | [Prisma 6.19](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) | Connection pooling, typed queries, automated migrations |
| **Authentication** | [Supabase Auth](https://supabase.com/) | SSR auth with `@supabase/ssr`, cookie sessions, domain enforcement |
| **QR Code Engine** | `qrcode` + `jsonwebtoken` + `html5-qrcode` | Tamper-proof signed passes & camera scanning pipeline |
| **Validation** | [Zod 4](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) | Schema-driven form handling and API input validation |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) | Modern toast notifications and persistent activity log |
| **Testing** | Node.js Test Runner (`ts-node`) | Automated unit & integration tests |

---

## 📊 Database Schema

```mermaid
erDiagram
    User ||--o{ Membership : "holds"
    User ||--o{ Registration : "makes"
    User ||--o{ Attendance : "logs"
    User ||--o{ Announcement : "publishes"
    User ||--o{ Notification : "receives"
    Club ||--o{ Membership : "has"
    Club ||--o{ Event : "hosts"
    Club ||--o{ Announcement : "issues"
    Event ||--o{ Registration : "contains"
    Event ||--o{ Attendance : "records"

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
        String clubId FK "nullable = college broadcast"
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

## 🔒 Security & RBAC Enforcement

CampusConnect protects access across three independent layers:

1. **Edge Middleware (`src/middleware.ts`)**:
   - Inspects Supabase session cookies on incoming requests.
   - Redirects unauthenticated visitors to `/login`.
   - Restricts `/admin/*` routes to `SUPER_ADMIN` and validates club admin parameters.
2. **Server Action Guard Functions (`src/lib/auth/permissions.ts`)**:
   - `requireUser()`: Ensures valid user context.
   - `requireRole(roles)`: Enforces role-level clearance.
   - `requireClubAdmin(clubId)`: Ensures a user is either a `SUPER_ADMIN` or has an active `LEAD` / `COORDINATOR` role for that specific club.
3. **Signed QR Token Verification**:
   - Admission tickets are signed using a server-side `QR_JWT_SECRET`.
   - Scanners verify HMAC signature, expiration time, registration status, and event match before admitting students.

---

## 📁 Project Directory Structure

```text
campus-connect/
├── prisma/
│   ├── schema.prisma              # Complete PostgreSQL schema & relations
│   └── seed.ts                    # Realistic campus seed dataset
├── scripts/
│   └── run-tests.ts               # Test suite runner
├── src/
│   ├── actions/                   # Server Actions
│   │   ├── announcements.ts       # Post & manage announcements
│   │   ├── auth.ts                # Login, signup, demo persona switching
│   │   ├── clubs.ts               # Club creation & membership requests
│   │   ├── events.ts              # Event scheduling & cancellation
│   │   └── registrations.ts       # Ticketing & auto-waitlist engine
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Login & Registration pages
│   │   ├── (dashboard)/           # Protected portal pages
│   │   │   ├── admin/             # Super Admin controls (clubs, users, broadcasts)
│   │   │   ├── announcements/     # Campus feeds
│   │   │   ├── clubs/             # Club directory & member dashboards
│   │   │   ├── events/            # Event details, QR ticket, & camera scanner
│   │   │   ├── my-clubs/          # Student membership manager
│   │   │   ├── my-events/         # Student ticket & attendance history
│   │   │   └── notifications/     # User notification inbox
│   │   ├── api/                   # Route handlers
│   │   │   ├── attendance/        # QR verification, manual check-in, CSV export
│   │   │   └── notifications/     # Notification status updates
│   │   └── layout.tsx             # Root layout with theme & persona switcher
│   ├── components/                # Reusable UI components
│   │   ├── clubs/                 # Club cards, forms, member roster
│   │   ├── events/                # Event card, ticket view, QR scanner UI
│   │   ├── layout/                # Navbar, sidebar, persona switcher
│   │   ├── shared/                # Error boundaries, loading skeletons
│   │   └── ui/                    # Base UI / shadcn design system
│   ├── lib/                       # Utility libraries
│   │   ├── auth/                  # RBAC permissions & session handlers
│   │   ├── mock-db.ts             # Zero-setup in-memory database
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── qr/                    # Token signing and QR generation
│   │   └── supabase/              # Client & Server Supabase connectors
│   ├── schemas/                   # Zod validation schemas
│   └── types/                     # Shared TypeScript interfaces
├── .env.example                   # Environment configuration template
├── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Option A: Run Instantly in Demo Mode (No Database Needed)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mraffankhan/Campus-Connect.git
   cd Campus-Connect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser:
   - Use the **Demo Persona Switcher** dropdown in the navigation header to switch instantly between Student, Club Lead, and Super Admin.

---

### Option B: Full Production Setup with Supabase & PostgreSQL

1. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your credentials in `.env.local`:
   ```ini
   # Supabase Credentials
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

   # Database URLs (Supabase Postgres)
   DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

   # Optional: Restrict student signup to your college domain
   ALLOWED_EMAIL_DOMAIN="college.edu"

   # Cryptographic secret for signing QR passes (min 32 chars)
   QR_JWT_SECRET="super-secret-jwt-key-for-campus-connect-attendance-32chars"

   # App Base URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

2. **Sync Database Schema:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

3. **Seed Database with Sample Data:**
   ```bash
   npm run seed
   ```
   *Populates the database with 1 Super Admin, 3 active clubs, 20 students, 10 events, registrations, and announcements.*

4. **Run the Application:**
   ```bash
   npm run dev
   ```

---

## 🧪 Automated Testing

CampusConnect includes comprehensive test suites testing role permissions, waitlist queuing, and QR signature security.

Run the test suite:
```bash
npm test
```

### Verified Scenarios:
- `permissions.test.ts`: Validates role barriers, Super Admin exclusivity on administrative routes, and club boundary isolation.
- `waitlist.test.ts`: Validates event capacity limits, FIFO queue placement, and automatic waitlist promotion upon cancellation.
- `qr.test.ts`: Validates HMAC token signature generation, expiration enforcement, and tamper rejection.

---

## 🚢 Production Deployment

Deploy seamlessly to [Vercel](https://vercel.com/):

1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure the environment variables specified in `.env.example`.
4. Deploy! Next.js will build the application and Prisma will prepare edge-ready queries.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Made with ❤️ for university student communities everywhere.
</div>
