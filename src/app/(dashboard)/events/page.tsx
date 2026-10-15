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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Campus Activities</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Campus Events</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Discover workshops, hackathons, seminars, and networking sessions
          </p>
        </div>

        <Link
          href="/my-events"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          My Registered Events
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Link
            href="/events?tab=upcoming"
            className={buttonVariants({
              variant: tab === "upcoming" ? "default" : "outline",
              size: "sm",
            })}
          >
            Upcoming Events
          </Link>
          <Link
            href="/events?tab=past"
            className={buttonVariants({
              variant: tab === "past" ? "default" : "outline",
              size: "sm",
            })}
          >
            Past Events
          </Link>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm">
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
