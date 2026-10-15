import { PrismaClient, Role, ClubStatus, MemberRole, MemberStatus, EventStatus, RegistrationStatus, CheckInMethod } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CampusConnect Database Seeding...");

  // 1. Clear existing data
  await prisma.notification.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.event.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Super Admin
  const superAdmin = await prisma.user.create({
    data: {
      name: "Dr. Evelyn Vance",
      email: "dean@college.edu",
      role: Role.SUPER_ADMIN,
      department: "Computer Science",
      year: 5,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
  });

  console.log(`✓ Super Admin created: ${superAdmin.name}`);

  // 3. Create 3 Club Admins
  const clubAdmin1 = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "sarah.chen@college.edu",
      role: Role.CLUB_ADMIN,
      department: "Computer Science",
      year: 4,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
  });

  const clubAdmin2 = await prisma.user.create({
    data: {
      name: "Marcus Miller",
      email: "marcus.miller@college.edu",
      role: Role.CLUB_ADMIN,
      department: "Electrical Engineering",
      year: 3,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  const clubAdmin3 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya.sharma@college.edu",
      role: Role.CLUB_ADMIN,
      department: "Information Technology",
      year: 4,
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    },
  });

  console.log("✓ 3 Club Admins created");

  // 4. Create 20 Students
  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Information Technology",
    "Civil Engineering",
  ];

  const studentData = [
    { name: "Liam Johnson", email: "liam.j@college.edu", year: 1 },
    { name: "Emma Watson", email: "emma.w@college.edu", year: 2 },
    { name: "Noah Williams", email: "noah.w@college.edu", year: 1 },
    { name: "Olivia Brown", email: "olivia.b@college.edu", year: 3 },
    { name: "James Jones", email: "james.j@college.edu", year: 2 },
    { name: "Sophia Garcia", email: "sophia.g@college.edu", year: 4 },
    { name: "Benjamin Davis", email: "benjamin.d@college.edu", year: 1 },
    { name: "Isabella Martinez", email: "isabella.m@college.edu", year: 3 },
    { name: "Mason Rodriguez", email: "mason.r@college.edu", year: 2 },
    { name: "Mia Hernandez", email: "mia.h@college.edu", year: 2 },
    { name: "Ethan Lopez", email: "ethan.l@college.edu", year: 4 },
    { name: "Harper Gonzalez", email: "harper.g@college.edu", year: 1 },
    { name: "Alexander Wilson", email: "alex.w@college.edu", year: 3 },
    { name: "Evelyn Anderson", email: "evelyn.a@college.edu", year: 2 },
    { name: "Daniel Thomas", email: "daniel.t@college.edu", year: 1 },
    { name: "Abigail Taylor", email: "abigail.t@college.edu", year: 3 },
    { name: "Henry Moore", email: "henry.m@college.edu", year: 4 },
    { name: "Emily Jackson", email: "emily.j@college.edu", year: 2 },
    { name: "Lucas Martin", email: "lucas.m@college.edu", year: 1 },
    { name: "Charlotte Lee", email: "charlotte.l@college.edu", year: 3 },
  ];

  const students: any[] = [];
  for (let i = 0; i < studentData.length; i++) {
    const s = studentData[i];
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        role: Role.STUDENT,
        department: departments[i % departments.length],
        year: s.year,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + i * 500000}?w=150`,
      },
    });
    students.push(user);
  }

  console.log(`✓ 20 Students created`);

  // 5. Create 3 Clubs
  const club1 = await prisma.club.create({
    data: {
      name: "ACM Student Chapter",
      slug: "acm-student-chapter",
      description: "Dedicated to advancing computing as a science and profession. We organize coding hackathons, guest lectures from top tech engineers, and technical workshops.",
      category: "Technology",
      logoUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200",
      status: ClubStatus.ACTIVE,
    },
  });

  const club2 = await prisma.club.create({
    data: {
      name: "Robotics & AI Society",
      slug: "robotics-ai-society",
      description: "Building autonomous systems, competing in RoboWars, and exploring machine learning algorithms and IoT hardware integration.",
      category: "Technology",
      logoUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=200",
      status: ClubStatus.ACTIVE,
    },
  });

  const club3 = await prisma.club.create({
    data: {
      name: "Fine Arts & Design Collective",
      slug: "fine-arts-design",
      description: "A creative sanctuary for campus painters, digital illustrators, UI/UX designers, and photography enthusiasts.",
      category: "Arts & Culture",
      logoUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200",
      status: ClubStatus.ACTIVE,
    },
  });

  console.log("✓ 3 Active Clubs created");

  // Assign club admins to their clubs as LEAD
  await prisma.membership.createMany({
    data: [
      { userId: clubAdmin1.id, clubId: club1.id, role: MemberRole.LEAD, status: MemberStatus.APPROVED },
      { userId: clubAdmin2.id, clubId: club2.id, role: MemberRole.LEAD, status: MemberStatus.APPROVED },
      { userId: clubAdmin3.id, clubId: club3.id, role: MemberRole.LEAD, status: MemberStatus.APPROVED },
    ],
  });

  // Assign students to clubs
  const membershipsData: any[] = [];
  students.forEach((student, idx) => {
    // Each student joins 1 or 2 clubs
    const clubA = idx % 2 === 0 ? club1 : club2;
    const clubB = club3;

    membershipsData.push({
      userId: student.id,
      clubId: clubA.id,
      role: idx % 4 === 0 ? MemberRole.COORDINATOR : MemberRole.MEMBER,
      status: MemberStatus.APPROVED,
    });

    if (idx % 3 === 0) {
      membershipsData.push({
        userId: student.id,
        clubId: clubB.id,
        role: MemberRole.MEMBER,
        status: idx % 6 === 0 ? MemberStatus.PENDING : MemberStatus.APPROVED,
      });
    }
  });

  await prisma.membership.createMany({ data: membershipsData });
  console.log("✓ Memberships created for students");

  // 6. Create 10 Events (5 Past, 5 Upcoming)
  const now = new Date();

  // Helper date offset
  const daysOffset = (days: number, hours: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(d.getHours() + hours);
    return d;
  };

  const events = [
    // Past events
    {
      clubId: club1.id,
      title: "Algorithmic Speed Coding Round",
      description: "A fast-paced competitive programming contest testing dynamic programming, graph theory, and greedy algorithms.",
      venue: "CS Lab 301",
      startsAt: daysOffset(-20, 10),
      endsAt: daysOffset(-20, 13),
      capacity: 30,
      isMembersOnly: false,
      status: EventStatus.COMPLETED,
      bannerUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    },
    {
      clubId: club2.id,
      title: "Arduino & Microcontroller Workshop",
      description: "Hands-on introduction to sensors, servos, and breadboard circuit design with hands-on kits provided.",
      venue: "Robotics Arena B",
      startsAt: daysOffset(-15, 14),
      endsAt: daysOffset(-15, 17),
      capacity: 25,
      isMembersOnly: false,
      status: EventStatus.COMPLETED,
      bannerUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
    },
    {
      clubId: club3.id,
      title: "Digital Art & Figma Masterclass",
      description: "Learn modern vector drawing, component architecture in Figma, and design system fundamentals.",
      venue: "Design Studio 2",
      startsAt: daysOffset(-10, 11),
      endsAt: daysOffset(-10, 14),
      capacity: 40,
      isMembersOnly: false,
      status: EventStatus.COMPLETED,
      bannerUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800",
    },
    {
      clubId: club1.id,
      title: "Web3 & Distributed Systems Seminar",
      description: "Deep dive into consensus algorithms, peer-to-peer protocols, and decentralized data stores.",
      venue: "Seminar Hall A",
      startsAt: daysOffset(-5, 15),
      endsAt: daysOffset(-5, 18),
      capacity: 50,
      isMembersOnly: true,
      status: EventStatus.COMPLETED,
      bannerUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    },
    {
      clubId: club2.id,
      title: "Autonomous Drone Flight Challenge",
      description: "Testing automated obstacle avoidance in our indoor drone flight cage.",
      venue: "Outdoor Quad A",
      startsAt: daysOffset(-2, 16),
      endsAt: daysOffset(-2, 19),
      capacity: 20,
      isMembersOnly: false,
      status: EventStatus.COMPLETED,
      bannerUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800",
    },

    // Upcoming events
    {
      clubId: club1.id,
      title: "HackCampus 2026: 24-Hour Hackathon",
      description: "Our flagship annual hackathon! Build innovative web, AI, and mobile solutions in 24 hours. Food, swag, and mentorship provided.",
      venue: "Main Campus Auditorium",
      startsAt: daysOffset(3, 9),
      endsAt: daysOffset(4, 9),
      capacity: 15, // intentionally low to demonstrate waitlist!
      registrationDeadline: daysOffset(2, 23),
      isMembersOnly: false,
      status: EventStatus.PUBLISHED,
      bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    },
    {
      clubId: club2.id,
      title: "AI Computer Vision Workshop",
      description: "Explore YOLO object detection and OpenCV real-time video processing pipelines on Raspberry Pi.",
      venue: "Makerspace Hall 1",
      startsAt: daysOffset(6, 14),
      endsAt: daysOffset(6, 17),
      capacity: 35,
      registrationDeadline: daysOffset(5, 18),
      isMembersOnly: false,
      status: EventStatus.PUBLISHED,
      bannerUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    },
    {
      clubId: club3.id,
      title: "Spring Campus Art Exhibition",
      description: "Displaying student oil paintings, sculptures, watercolor works, and interactive 3D installations.",
      venue: "Student Center Gallery",
      startsAt: daysOffset(10, 10),
      endsAt: daysOffset(10, 18),
      capacity: 100,
      registrationDeadline: daysOffset(9, 23),
      isMembersOnly: false,
      status: EventStatus.PUBLISHED,
      bannerUrl: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
    },
    {
      clubId: club1.id,
      title: "ACM Core Team Internal Sync & Strategy",
      description: "Planning upcoming hackathon tracks, budgets, and executive committee elections.",
      venue: "Conference Room 4B",
      startsAt: daysOffset(14, 17),
      endsAt: daysOffset(14, 19),
      capacity: 20,
      registrationDeadline: daysOffset(13, 23),
      isMembersOnly: true, // Members-only flag
      status: EventStatus.PUBLISHED,
      bannerUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    },
    {
      clubId: club2.id,
      title: "Combat Robotics Arena Exhibition",
      description: "3lb antweight robot combat exhibition with arena hazards and live audience voting.",
      venue: "Engineering Courtyard",
      startsAt: daysOffset(20, 15),
      endsAt: daysOffset(20, 18),
      capacity: 80,
      registrationDeadline: daysOffset(19, 23),
      isMembersOnly: false,
      status: EventStatus.PUBLISHED,
      bannerUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
    },
  ];

  const createdEvents: any[] = [];
  for (const evt of events) {
    const created = await prisma.event.create({ data: evt });
    createdEvents.push(created);
  }

  console.log("✓ 10 Events (5 past, 5 upcoming) created");

  // 7. Seed Registrations & Attendance for Past Events
  const pastEvents = createdEvents.filter((e) => e.status === EventStatus.COMPLETED);
  const upcomingFlagship = createdEvents.find((e) => e.title.includes("HackCampus"));

  for (const pEvent of pastEvents) {
    // Register 12 students
    for (let i = 0; i < 12; i++) {
      const student = students[i];
      await prisma.registration.create({
        data: {
          eventId: pEvent.id,
          userId: student.id,
          status: RegistrationStatus.CONFIRMED,
          registeredAt: daysOffset(-25, i),
        },
      });

      // 8 of them attended
      if (i < 8) {
        await prisma.attendance.create({
          data: {
            eventId: pEvent.id,
            userId: student.id,
            method: i % 2 === 0 ? CheckInMethod.QR : CheckInMethod.MANUAL,
            markedBy: "Sarah Chen",
            checkedInAt: new Date(pEvent.startsAt),
          },
        });
      }
    }
  }

  // Seed registrations for Upcoming Flagship (Capacity: 15)
  // Register 18 students to generate both CONFIRMED (15) and WAITLISTED (3)
  if (upcomingFlagship) {
    for (let i = 0; i < 18; i++) {
      const student = students[i];
      const isWaitlisted = i >= 15;
      await prisma.registration.create({
        data: {
          eventId: upcomingFlagship.id,
          userId: student.id,
          status: isWaitlisted ? RegistrationStatus.WAITLISTED : RegistrationStatus.CONFIRMED,
          registeredAt: daysOffset(-1, i),
        },
      });
    }
  }

  console.log("✓ Sample registrations, waitlist records, and attendance generated");

  // 8. Create Announcements
  await prisma.announcement.createMany({
    data: [
      {
        clubId: null, // College-wide
        authorId: superAdmin.id,
        title: "Welcome to Fall 2026 Semester & Club Portal Launch",
        body: "We are thrilled to unveil CampusConnect! All students are encouraged to explore campus clubs, register for student activities, and use digital QR check-in at official events.",
        pinned: true,
        createdAt: daysOffset(-15),
      },
      {
        clubId: null, // College-wide
        authorId: superAdmin.id,
        title: "Annual Student Organization Funding Grants Open",
        body: "Registered club leadership can now submit semester event budget proposals to the Dean of Student Affairs before the end of the month.",
        pinned: false,
        createdAt: daysOffset(-7),
      },
      {
        clubId: club1.id,
        authorId: clubAdmin1.id,
        title: "HackCampus 2026 Mentor Applications",
        body: "We are looking for senior students to serve as code mentors for first-year participants during HackCampus next weekend. Reach out in the Discord channel!",
        pinned: true,
        createdAt: daysOffset(-3),
      },
      {
        clubId: club2.id,
        authorId: clubAdmin2.id,
        title: "3D Printer Access in Makerspace Hall 1",
        body: "All Robotics & AI Society members now have certified access to the Bambu Lab 3D printers after 4 PM on weekdays.",
        pinned: false,
        createdAt: daysOffset(-2),
      },
    ],
  });

  console.log("✓ Announcements created (College-wide and Club-scoped)");

  // 9. Create Notifications for Students
  await prisma.notification.createMany({
    data: [
      {
        userId: students[0].id,
        title: "Registration Confirmed!",
        body: "You are confirmed for HackCampus 2026: 24-Hour Hackathon. Access your QR pass.",
        link: `/events/${upcomingFlagship?.id}/qr`,
        read: false,
        createdAt: daysOffset(0, -3),
      },
      {
        userId: students[15].id,
        title: "Added to Waitlist",
        body: "Capacity reached for HackCampus 2026. You are in priority line for waitlist promotion.",
        link: `/events/${upcomingFlagship?.id}`,
        read: false,
        createdAt: daysOffset(0, -2),
      },
      {
        userId: students[0].id,
        title: "Welcome to ACM Student Chapter",
        body: "Your membership application has been approved by the club lead.",
        link: `/clubs/${club1.slug}`,
        read: true,
        createdAt: daysOffset(-10),
      },
    ],
  });

  console.log("✓ In-app notifications seeded");
  console.log("🎉 Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
