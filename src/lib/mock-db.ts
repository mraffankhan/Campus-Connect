import {
  ALL_DEMO_USERS,
  INITIAL_CLUBS,
  INITIAL_MEMBERSHIPS,
  INITIAL_EVENTS,
  INITIAL_REGISTRATIONS,
  INITIAL_ATTENDANCES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  MockUser,
  MockClub,
  MockMembership,
  MockEvent,
  MockRegistration,
  MockAttendance,
  MockAnnouncement,
  MockNotification,
} from "./mock-data";

// Store in globalThis to preserve in-memory mutations across Next.js dev server rebuilds
interface MockDbStore {
  users: MockUser[];
  clubs: MockClub[];
  memberships: MockMembership[];
  events: MockEvent[];
  registrations: MockRegistration[];
  attendances: MockAttendance[];
  announcements: MockAnnouncement[];
  notifications: MockNotification[];
}

const g = globalThis as unknown as { __campusConnectDb?: MockDbStore };

if (!g.__campusConnectDb) {
  g.__campusConnectDb = {
    users: [...ALL_DEMO_USERS],
    clubs: [...INITIAL_CLUBS],
    memberships: [...INITIAL_MEMBERSHIPS],
    events: [...INITIAL_EVENTS],
    registrations: [...INITIAL_REGISTRATIONS],
    attendances: [...INITIAL_ATTENDANCES],
    announcements: [...INITIAL_ANNOUNCEMENTS],
    notifications: [...INITIAL_NOTIFICATIONS],
  };
}

export const db = g.__campusConnectDb;

function matchesWhere(item: any, where?: any): boolean {
  if (!where) return true;

  for (const key of Object.keys(where)) {
    const condition = where[key];
    if (condition === undefined) continue;

    if (key === "OR" && Array.isArray(condition)) {
      if (!condition.some((subCond) => matchesWhere(item, subCond))) return false;
      continue;
    }

    if (key === "AND" && Array.isArray(condition)) {
      if (!condition.every((subCond) => matchesWhere(item, subCond))) return false;
      continue;
    }

    if (key === "userId_clubId" && typeof condition === "object") {
      if (item.userId !== condition.userId || item.clubId !== condition.clubId) return false;
      continue;
    }

    if (key === "eventId_userId" && typeof condition === "object") {
      if (item.eventId !== condition.eventId || item.userId !== condition.userId) return false;
      continue;
    }

    // Nested relation filter (e.g. event: { startsAt: { gte: ... } })
    if (key === "event" && typeof condition === "object") {
      const relEvent = db.events.find((e) => e.id === item.eventId);
      if (!relEvent || !matchesWhere(relEvent, condition)) return false;
      continue;
    }

    if (key === "club" && typeof condition === "object") {
      const relClub = db.clubs.find((c) => c.id === item.clubId);
      if (!relClub || !matchesWhere(relClub, condition)) return false;
      continue;
    }

    const val = item[key];

    if (condition !== null && typeof condition === "object" && !(condition instanceof Date)) {
      if ("in" in condition && Array.isArray(condition.in)) {
        if (!condition.in.includes(val)) return false;
        continue;
      }
      if ("not" in condition) {
        if (val === condition.not) return false;
        continue;
      }
      if ("gte" in condition) {
        const target = condition.gte instanceof Date ? condition.gte.getTime() : condition.gte;
        const current = val instanceof Date ? val.getTime() : val;
        if (current < target) return false;
        continue;
      }
      if ("lte" in condition) {
        const target = condition.lte instanceof Date ? condition.lte.getTime() : condition.lte;
        const current = val instanceof Date ? val.getTime() : val;
        if (current > target) return false;
        continue;
      }
      if ("contains" in condition) {
        const strVal = String(val ?? "").toLowerCase();
        const search = String(condition.contains ?? "").toLowerCase();
        if (!strVal.includes(search)) return false;
        continue;
      }
    }

    if (val instanceof Date && condition instanceof Date) {
      if (val.getTime() !== condition.getTime()) return false;
      continue;
    }

    if (val !== condition) {
      return false;
    }
  }

  return true;
}

function sortItems<T>(items: T[], orderBy?: any): T[] {
  if (!orderBy) return items;
  const copy = [...items];

  const orderRules = Array.isArray(orderBy) ? orderBy : [orderBy];

  copy.sort((a: any, b: any) => {
    for (const rule of orderRules) {
      for (const key of Object.keys(rule)) {
        const direction = rule[key] === "desc" ? -1 : 1;
        let valA = a[key];
        let valB = b[key];

        // nested orderBy e.g. { event: { startsAt: 'asc' } }
        if (typeof rule[key] === "object" && !(rule[key] instanceof Date)) {
          if (key === "event") {
            const nestedKey = Object.keys(rule[key])[0];
            valA = (db.events.find((e) => e.id === a.eventId) as any)?.[nestedKey];
            valB = (db.events.find((e) => e.id === b.eventId) as any)?.[nestedKey];
          }
        }

        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();

        if (valA < valB) return -1 * direction;
        if (valA > valB) return 1 * direction;
      }
    }
    return 0;
  });

  return copy;
}

function enrichClub(club: MockClub, include?: any, select?: any) {
  let res: any = { ...club };

  if (include?._count) {
    const memWhere = include._count.select?.memberships?.where;
    const evtWhere = include._count.select?.events?.where;

    const membershipsCount = db.memberships.filter(
      (m) => m.clubId === club.id && matchesWhere(m, memWhere)
    ).length;

    const eventsCount = db.events.filter(
      (e) => e.clubId === club.id && matchesWhere(e, evtWhere)
    ).length;

    res._count = {
      memberships: membershipsCount,
      events: eventsCount,
    };
  }

  if (include?.memberships) {
    let mems = db.memberships.filter((m) => m.clubId === club.id);
    if (include.memberships.where) {
      mems = mems.filter((m) => matchesWhere(m, include.memberships.where));
    }
    if (include.memberships.include?.user) {
      mems = mems.map((m) => ({
        ...m,
        user: db.users.find((u) => u.id === m.userId),
      }));
    }
    res.memberships = mems;
  }

  if (include?.events) {
    res.events = db.events.filter((e) => e.clubId === club.id);
  }

  if (include?.announcements) {
    res.announcements = db.announcements.filter((a) => a.clubId === club.id);
  }

  if (select) {
    const filtered: any = {};
    for (const k of Object.keys(select)) {
      if (select[k]) filtered[k] = res[k];
    }
    return filtered;
  }

  return res;
}

function enrichEvent(event: MockEvent, include?: any, select?: any) {
  let res: any = { ...event };

  if (include?.club) {
    const club = db.clubs.find((c) => c.id === event.clubId);
    res.club = club ? enrichClub(club, include.club.include, include.club.select) : null;
  }

  if (include?._count) {
    const regWhere = include._count.select?.registrations?.where;
    res._count = {
      registrations: db.registrations.filter(
        (r) => r.eventId === event.id && matchesWhere(r, regWhere)
      ).length,
      attendances: db.attendances.filter((a) => a.eventId === event.id).length,
    };
  }

  if (include?.registrations) {
    let regs = db.registrations.filter((r) => r.eventId === event.id);
    if (include.registrations.where) {
      regs = regs.filter((r) => matchesWhere(r, include.registrations.where));
    }
    if (include.registrations.include?.user) {
      regs = regs.map((r) => ({
        ...r,
        user: db.users.find((u) => u.id === r.userId),
      }));
    }
    res.registrations = regs;
  }

  if (include?.attendances) {
    let atts = db.attendances.filter((a) => a.eventId === event.id);
    if (include.attendances.include?.user) {
      atts = atts.map((a) => ({
        ...a,
        user: db.users.find((u) => u.id === a.userId),
      }));
    }
    res.attendances = atts;
  }

  if (select) {
    const filtered: any = {};
    for (const k of Object.keys(select)) {
      if (select[k]) filtered[k] = res[k];
    }
    return filtered;
  }

  return res;
}

function enrichMembership(mem: MockMembership, include?: any, select?: any) {
  let res: any = { ...mem };

  if (include?.club) {
    const club = db.clubs.find((c) => c.id === mem.clubId);
    res.club = club ? enrichClub(club, include.club.include, include.club.select) : null;
  }

  if (include?.user) {
    res.user = db.users.find((u) => u.id === mem.userId);
  }

  if (select) {
    const filtered: any = {};
    for (const k of Object.keys(select)) {
      if (select[k]) filtered[k] = res[k];
    }
    return filtered;
  }

  return res;
}

function enrichRegistration(reg: MockRegistration, include?: any, select?: any) {
  let res: any = { ...reg };

  if (include?.event) {
    const event = db.events.find((e) => e.id === reg.eventId);
    res.event = event ? enrichEvent(event, include.event.include, include.event.select) : null;
  }

  if (include?.user) {
    res.user = db.users.find((u) => u.id === reg.userId);
  }

  if (select) {
    const filtered: any = {};
    for (const k of Object.keys(select)) {
      if (select[k]) filtered[k] = res[k];
    }
    return filtered;
  }

  return res;
}

function enrichAttendance(att: MockAttendance, include?: any, select?: any) {
  let res: any = { ...att };

  if (include?.event) {
    const event = db.events.find((e) => e.id === att.eventId);
    res.event = event ? enrichEvent(event, include.event.include, include.event.select) : null;
  }

  if (include?.user) {
    res.user = db.users.find((u) => u.id === att.userId);
  }

  if (select) {
    const filtered: any = {};
    for (const k of Object.keys(select)) {
      if (select[k]) filtered[k] = res[k];
    }
    return filtered;
  }

  return res;
}

function enrichAnnouncement(ann: MockAnnouncement, include?: any, select?: any) {
  let res: any = { ...ann };

  if (include?.club) {
    const club = db.clubs.find((c) => c.id === ann.clubId);
    res.club = club ? enrichClub(club, include.club.include, include.club.select) : null;
  }

  if (include?.author) {
    const author = db.users.find((u) => u.id === ann.authorId);
    if (author) {
      if (include.author.select) {
        const filtered: any = {};
        for (const k of Object.keys(include.author.select)) {
          if (include.author.select[k]) filtered[k] = (author as any)[k];
        }
        res.author = filtered;
      } else {
        res.author = author;
      }
    } else {
      res.author = null;
    }
  }

  if (select) {
    const filtered: any = {};
    for (const k of Object.keys(select)) {
      if (select[k]) filtered[k] = res[k];
    }
    return filtered;
  }

  return res;
}

// ─── Exported Mock Prisma Client ───────────────────────────────────────────────

export const mockPrisma = {
  user: {
    findUnique: async ({ where, select }: any) => {
      const user = db.users.find((u) => matchesWhere(u, where));
      if (!user) return null;
      if (select) {
        const res: any = {};
        for (const k of Object.keys(select)) if (select[k]) res[k] = (user as any)[k];
        return res;
      }
      return { ...user };
    },
    findFirst: async ({ where, select }: any) => {
      const user = db.users.find((u) => matchesWhere(u, where));
      if (!user) return null;
      if (select) {
        const res: any = {};
        for (const k of Object.keys(select)) if (select[k]) res[k] = (user as any)[k];
        return res;
      }
      return { ...user };
    },
    findMany: async ({ where, orderBy, select, skip, take }: any = {}) => {
      let items = db.users.filter((u) => matchesWhere(u, where));
      items = sortItems(items, orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      if (select) {
        return items.map((u) => {
          const res: any = {};
          for (const k of Object.keys(select)) if (select[k]) res[k] = (u as any)[k];
          return res;
        });
      }
      return items.map((u) => ({ ...u }));
    },
    count: async ({ where }: any = {}) => {
      return db.users.filter((u) => matchesWhere(u, where)).length;
    },
    create: async ({ data }: any) => {
      const newUser: MockUser = {
        id: data.id || `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: data.name,
        email: data.email,
        role: data.role || "STUDENT",
        department: data.department || null,
        year: data.year || null,
        avatarUrl: data.avatarUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        supabaseId: data.supabaseId || null,
      };
      db.users.push(newUser);
      return { ...newUser };
    },
    update: async ({ where, data }: any) => {
      const user = db.users.find((u) => matchesWhere(u, where));
      if (!user) throw new Error("User not found to update");
      Object.assign(user, data, { updatedAt: new Date() });
      return { ...user };
    },
  },

  club: {
    findUnique: async ({ where, include, select }: any) => {
      const club = db.clubs.find((c) => matchesWhere(c, where));
      if (!club) return null;
      return enrichClub(club, include, select);
    },
    findFirst: async ({ where, include, select }: any) => {
      const club = db.clubs.find((c) => matchesWhere(c, where));
      if (!club) return null;
      return enrichClub(club, include, select);
    },
    findMany: async ({ where, include, select, orderBy, skip, take }: any = {}) => {
      let items = db.clubs.filter((c) => matchesWhere(c, where));
      items = sortItems(items, orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items.map((c) => enrichClub(c, include, select));
    },
    count: async ({ where }: any = {}) => {
      return db.clubs.filter((c) => matchesWhere(c, where)).length;
    },
    create: async ({ data }: any) => {
      const newClub: MockClub = {
        id: data.id || `club-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        category: data.category || null,
        logoUrl: data.logoUrl || null,
        status: data.status || "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.clubs.push(newClub);
      return { ...newClub };
    },
    update: async ({ where, data }: any) => {
      const club = db.clubs.find((c) => matchesWhere(c, where));
      if (!club) throw new Error("Club not found to update");
      Object.assign(club, data, { updatedAt: new Date() });
      return { ...club };
    },
  },

  membership: {
    findUnique: async ({ where, include, select }: any) => {
      const mem = db.memberships.find((m) => matchesWhere(m, where));
      if (!mem) return null;
      return enrichMembership(mem, include, select);
    },
    findFirst: async ({ where, include, select }: any) => {
      const mem = db.memberships.find((m) => matchesWhere(m, where));
      if (!mem) return null;
      return enrichMembership(mem, include, select);
    },
    findMany: async ({ where, include, select, orderBy, skip, take }: any = {}) => {
      let items = db.memberships.filter((m) => matchesWhere(m, where));
      items = sortItems(items, orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items.map((m) => enrichMembership(m, include, select));
    },
    count: async ({ where }: any = {}) => {
      return db.memberships.filter((m) => matchesWhere(m, where)).length;
    },
    create: async ({ data }: any) => {
      const newMem: MockMembership = {
        id: data.id || `mem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: data.userId,
        clubId: data.clubId,
        role: data.role || "MEMBER",
        status: data.status || "PENDING",
        joinedAt: new Date(),
      };
      db.memberships.push(newMem);
      return { ...newMem };
    },
    update: async ({ where, data }: any) => {
      const mem = db.memberships.find((m) => matchesWhere(m, where));
      if (!mem) throw new Error("Membership not found to update");
      Object.assign(mem, data);
      return { ...mem };
    },
    delete: async ({ where }: any) => {
      const idx = db.memberships.findIndex((m) => matchesWhere(m, where));
      if (idx === -1) throw new Error("Membership not found to delete");
      const [removed] = db.memberships.splice(idx, 1);
      return { ...removed };
    },
    deleteMany: async ({ where }: any = {}) => {
      const initial = db.memberships.length;
      db.memberships = db.memberships.filter((m) => !matchesWhere(m, where));
      return { count: initial - db.memberships.length };
    },
  },

  event: {
    findUnique: async ({ where, include, select }: any) => {
      const event = db.events.find((e) => matchesWhere(e, where));
      if (!event) return null;
      return enrichEvent(event, include, select);
    },
    findFirst: async ({ where, include, select }: any) => {
      const event = db.events.find((e) => matchesWhere(e, where));
      if (!event) return null;
      return enrichEvent(event, include, select);
    },
    findMany: async ({ where, include, select, orderBy, skip, take }: any = {}) => {
      let items = db.events.filter((e) => matchesWhere(e, where));
      items = sortItems(items, orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items.map((e) => enrichEvent(e, include, select));
    },
    count: async ({ where }: any = {}) => {
      return db.events.filter((e) => matchesWhere(e, where)).length;
    },
    create: async ({ data }: any) => {
      const newEvent: MockEvent = {
        id: data.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        clubId: data.clubId,
        title: data.title,
        description: data.description || null,
        venue: data.venue || null,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        capacity: data.capacity !== undefined ? data.capacity : null,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        status: data.status || "DRAFT",
        isMembersOnly: !!data.isMembersOnly,
        bannerUrl: data.bannerUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.events.push(newEvent);
      return { ...newEvent };
    },
    update: async ({ where, data }: any) => {
      const event = db.events.find((e) => matchesWhere(e, where));
      if (!event) throw new Error("Event not found to update");
      Object.assign(event, data, { updatedAt: new Date() });
      return { ...event };
    },
  },

  registration: {
    findUnique: async ({ where, include, select }: any) => {
      const reg = db.registrations.find((r) => matchesWhere(r, where));
      if (!reg) return null;
      return enrichRegistration(reg, include, select);
    },
    findFirst: async ({ where, include, select, orderBy }: any) => {
      let items = db.registrations.filter((r) => matchesWhere(r, where));
      items = sortItems(items, orderBy);
      if (items.length === 0) return null;
      return enrichRegistration(items[0], include, select);
    },
    findMany: async ({ where, include, select, orderBy, skip, take }: any = {}) => {
      let items = db.registrations.filter((r) => matchesWhere(r, where));
      items = sortItems(items, orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items.map((r) => enrichRegistration(r, include, select));
    },
    count: async ({ where }: any = {}) => {
      return db.registrations.filter((r) => matchesWhere(r, where)).length;
    },
    create: async ({ data }: any) => {
      const newReg: MockRegistration = {
        id: data.id || `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        eventId: data.eventId,
        userId: data.userId,
        status: data.status || "CONFIRMED",
        registeredAt: new Date(),
      };
      db.registrations.push(newReg);
      return { ...newReg };
    },
    update: async ({ where, data }: any) => {
      const reg = db.registrations.find((r) => matchesWhere(r, where));
      if (!reg) throw new Error("Registration not found to update");
      Object.assign(reg, data);
      return { ...reg };
    },
    delete: async ({ where }: any) => {
      const idx = db.registrations.findIndex((r) => matchesWhere(r, where));
      if (idx === -1) throw new Error("Registration not found to delete");
      const [removed] = db.registrations.splice(idx, 1);
      return { ...removed };
    },
    deleteMany: async ({ where }: any = {}) => {
      const initial = db.registrations.length;
      db.registrations = db.registrations.filter((r) => !matchesWhere(r, where));
      return { count: initial - db.registrations.length };
    },
  },

  attendance: {
    findUnique: async ({ where, include, select }: any) => {
      const att = db.attendances.find((a) => matchesWhere(a, where));
      if (!att) return null;
      return enrichAttendance(att, include, select);
    },
    findFirst: async ({ where, include, select }: any) => {
      const att = db.attendances.find((a) => matchesWhere(a, where));
      if (!att) return null;
      return enrichAttendance(att, include, select);
    },
    findMany: async ({ where, include, select, orderBy, skip, take }: any = {}) => {
      let items = db.attendances.filter((a) => matchesWhere(a, where));
      items = sortItems(items, orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items.map((a) => enrichAttendance(a, include, select));
    },
    count: async ({ where }: any = {}) => {
      return db.attendances.filter((a) => matchesWhere(a, where)).length;
    },
    create: async ({ data }: any) => {
      const newAtt: MockAttendance = {
        id: data.id || `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        eventId: data.eventId,
        userId: data.userId,
        checkedInAt: new Date(),
        method: data.method || "QR",
        markedBy: data.markedBy || null,
      };
      db.attendances.push(newAtt);
      return { ...newAtt };
    },
    update: async ({ where, data }: any) => {
      const att = db.attendances.find((a) => matchesWhere(a, where));
      if (!att) throw new Error("Attendance record not found to update");
      Object.assign(att, data);
      return { ...att };
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = db.attendances.find((a) => matchesWhere(a, where));
      if (existing) {
        Object.assign(existing, update);
        return { ...existing };
      } else {
        const newAtt: MockAttendance = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          eventId: create.eventId,
          userId: create.userId,
          checkedInAt: create.checkedInAt || new Date(),
          method: create.method || "QR",
          markedBy: create.markedBy || null,
        };
        db.attendances.push(newAtt);
        return { ...newAtt };
      }
    },
    delete: async ({ where }: any) => {
      const idx = db.attendances.findIndex((a) => matchesWhere(a, where));
      if (idx === -1) throw new Error("Attendance not found to delete");
      const [removed] = db.attendances.splice(idx, 1);
      return { ...removed };
    },
    deleteMany: async ({ where }: any = {}) => {
      const initial = db.attendances.length;
      db.attendances = db.attendances.filter((a) => !matchesWhere(a, where));
      return { count: initial - db.attendances.length };
    },
  },

  announcement: {
    findUnique: async ({ where, include, select }: any) => {
      const ann = db.announcements.find((a) => matchesWhere(a, where));
      if (!ann) return null;
      return enrichAnnouncement(ann, include, select);
    },
    findFirst: async ({ where, include, select }: any) => {
      const ann = db.announcements.find((a) => matchesWhere(a, where));
      if (!ann) return null;
      return enrichAnnouncement(ann, include, select);
    },
    findMany: async ({ where, include, select, orderBy, skip, take }: any = {}) => {
      let items = db.announcements.filter((a) => matchesWhere(a, where));
      items = sortItems(items, orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items.map((a) => enrichAnnouncement(a, include, select));
    },
    count: async ({ where }: any = {}) => {
      return db.announcements.filter((a) => matchesWhere(a, where)).length;
    },
    create: async ({ data }: any) => {
      const newAnn: MockAnnouncement = {
        id: data.id || `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        clubId: data.clubId || null,
        authorId: data.authorId,
        title: data.title,
        body: data.body,
        pinned: !!data.pinned,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.announcements.push(newAnn);
      return { ...newAnn };
    },
    update: async ({ where, data }: any) => {
      const ann = db.announcements.find((a) => matchesWhere(a, where));
      if (!ann) throw new Error("Announcement not found to update");
      Object.assign(ann, data, { updatedAt: new Date() });
      return { ...ann };
    },
    delete: async ({ where }: any) => {
      const idx = db.announcements.findIndex((a) => matchesWhere(a, where));
      if (idx === -1) throw new Error("Announcement not found to delete");
      const [removed] = db.announcements.splice(idx, 1);
      return { ...removed };
    },
  },

  notification: {
    findMany: async ({ where, orderBy, skip, take }: any = {}) => {
      let items = db.notifications.filter((n) => matchesWhere(n, where));
      items = sortItems(items, orderBy);
      if (skip) items = items.slice(skip);
      if (take) items = items.slice(0, take);
      return items.map((n) => ({ ...n }));
    },
    count: async ({ where }: any = {}) => {
      return db.notifications.filter((n) => matchesWhere(n, where)).length;
    },
    create: async ({ data }: any) => {
      const newNotif: MockNotification = {
        id: data.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: data.userId,
        title: data.title,
        body: data.body,
        link: data.link || null,
        read: !!data.read,
        createdAt: new Date(),
      };
      db.notifications.push(newNotif);
      return { ...newNotif };
    },
    createMany: async ({ data }: { data: any[] }) => {
      for (const item of data) {
        db.notifications.push({
          id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId: item.userId,
          title: item.title,
          body: item.body,
          link: item.link || null,
          read: !!item.read,
          createdAt: new Date(),
        });
      }
      return { count: data.length };
    },
    update: async ({ where, data }: any) => {
      const notif = db.notifications.find((n) => matchesWhere(n, where));
      if (!notif) throw new Error("Notification not found to update");
      Object.assign(notif, data);
      return { ...notif };
    },
    updateMany: async ({ where, data }: any) => {
      let count = 0;
      for (const notif of db.notifications) {
        if (matchesWhere(notif, where)) {
          Object.assign(notif, data);
          count++;
        }
      }
      return { count };
    },
    deleteMany: async ({ where }: any = {}) => {
      const initial = db.notifications.length;
      db.notifications = db.notifications.filter((n) => !matchesWhere(n, where));
      return { count: initial - db.notifications.length };
    },
  },

  $transaction: async (callbackOrArray: any) => {
    if (typeof callbackOrArray === "function") {
      return await callbackOrArray(mockPrisma);
    }
    if (Array.isArray(callbackOrArray)) {
      return await Promise.all(callbackOrArray);
    }
    throw new Error("Invalid transaction argument");
  },
};
