import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { ClubCard } from "@/components/clubs/club-card";
import { SearchFilter } from "@/components/shared/search-filter";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { CLUB_CATEGORIES, ITEMS_PER_PAGE } from "@/lib/constants";
import { Users, Plus, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface ClubsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function ClubsPage({ searchParams }: ClubsPageProps) {
  await requireSession();
  const resolvedParams = await searchParams;

  const query = resolvedParams.q || "";
  const category = resolvedParams.category || "";
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10));

  const whereClause: any = {
    status: { in: ["ACTIVE", "PENDING"] },
  };

  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (category && category !== "ALL") {
    whereClause.category = category;
  }

  const [clubs, totalCount] = await Promise.all([
    prisma.club.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            memberships: { where: { status: "APPROVED" } },
            events: { where: { status: { in: ["PUBLISHED", "COMPLETED"] } } },
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.club.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const categoryOptions = CLUB_CATEGORIES.map((cat) => ({
    label: cat,
    value: cat,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-primary/20">
        <div>
          <div className="flex items-center gap-2 text-primary font-mono text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span className="pulse-dot" />
            <span>CAMPUS SOCIETIES DIRECTORY</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white">
            Explore Campus Clubs
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            Discover student societies, technical chapters, esports squads, and cultural guilds
          </p>
        </div>

        <Link
          href="/clubs/new"
          className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-md bg-primary text-white font-bold border border-rose-400 shadow-[0_0_18px_rgba(240,0,16,0.6)] hover:bg-[#ff1a2b] transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Propose Society
        </Link>
      </div>

      {/* Search & Category Filter */}
      <div className="p-4 rounded-xl border border-primary/25 bg-[#090102] shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]">
        <SearchFilter
          placeholder="Search clubs by name or keywords..."
          filterParamName="category"
          filterLabel="All Categories"
          filterOptions={categoryOptions}
        />
      </div>

      {/* Club Grid */}
      {clubs.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clubs found"
          description={
            query || category
              ? "Try adjusting your search criteria or clear filters to see more organizations."
              : "No clubs are registered on campus yet. Be the first to start one!"
          }
          action={{
            label: "Request a New Club",
            href: "/clubs/new",
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club as any} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
