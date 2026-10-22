import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { EventCard } from "@/components/events/event-card";
import { SearchFilter } from "@/components/shared/search-filter";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { Calendar, Sparkles } from "lucide-react";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface EventsPageProps {
  searchParams: Promise<{
    q?: string;
    tab?: string;
    page?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const user = await requireSession();
  const resolvedParams = await searchParams;

  const query = resolvedParams.q || "";
  const tab = resolvedParams.tab || "upcoming";
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  const now = new Date();
  const whereClause: any = {
    status: { in: ["PUBLISHED", "COMPLETED"] },
  };

  if (tab === "past") {
    whereClause.endsAt = { lt: now };
  } else {
    whereClause.endsAt = { gte: now };
  }

  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { venue: { contains: query, mode: "insensitive" } },
      { club: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  const [events, totalCount, userRegistrations] = await Promise.all([
    prisma.event.findMany({
      where: whereClause,
      include: {
        club: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        _count: {
          select: {
            registrations: { where: { status: "CONFIRMED" } },
          },
        },
      },
      orderBy: tab === "past" ? { startsAt: "desc" } : { startsAt: "asc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.event.count({ where: whereClause }),
    prisma.registration.findMany({
      where: {
        userId: user.id,
        status: { in: ["CONFIRMED", "WAITLISTED"] },
      },
      select: { eventId: true },
    }),
  ]);

  const registeredEventIds = new Set(userRegistrations.map((r) => r.eventId));
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-primary/20">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span className="pulse-dot" />
            <span>CAMPUS EVENT RADAR</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white">
            Campus Events & Hackathons
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Discover workshops, esports qualifiers, hackathons, and guest seminars
          </p>
        </div>

        <Link
          href="/my-events"
          className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md border border-primary/40 bg-primary/10 hover:border-primary text-white transition-all shadow-[inset_0_1px_0_rgba(240,0,16,0.2)] hover:shadow-[0_0_16px_rgba(240,0,16,0.35)]"
        >
          My Registered Passes &rarr;
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-primary/20 pb-3">
          <Link
            href="/events?tab=upcoming"
            className={`font-mono text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-md transition-all ${
              tab === "upcoming"
                ? "bg-primary text-white font-bold border border-rose-400 shadow-[0_0_15px_rgba(240,0,16,0.5)]"
                : "border border-primary/20 text-muted-foreground hover:text-white hover:bg-primary/10"
            }`}
          >
            Upcoming Events
          </Link>
          <Link
            href="/events?tab=past"
            className={`font-mono text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-md transition-all ${
              tab === "past"
                ? "bg-primary text-white font-bold border border-rose-400 shadow-[0_0_15px_rgba(240,0,16,0.5)]"
                : "border border-primary/20 text-muted-foreground hover:text-white hover:bg-primary/10"
            }`}
          >
            Past Archives
          </Link>
        </div>

        <div className="p-4 rounded-xl border border-primary/25 bg-[#090102] shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]">
          <SearchFilter placeholder="Search events by title, venue, or club name..." />
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={tab === "upcoming" ? "No upcoming events scheduled" : "No past events found"}
          description={
            query
              ? "No events matched your search query. Try different terms."
              : tab === "upcoming"
              ? "Check back soon or explore campus clubs to see their planned activities."
              : "Events that have concluded will be archived here."
          }
          action={{
            label: "Explore Clubs",
            href: "/clubs",
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event as any}
                isRegistered={registeredEventIds.has(event.id)}
              />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
