import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { Users, ArrowRight, Heart, Calendar, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyClubsPage() {
  const user = await requireSession();

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: {
      club: {
        include: {
          _count: {
            select: {
              memberships: { where: { status: "APPROVED" } },
              events: true,
            },
          },
        },
      },
    },
    orderBy: [{ status: "asc" }, { role: "desc" }, { joinedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <Heart className="h-3.5 w-3.5" />
            <span>My Memberships</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Clubs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Clubs you have joined or applied for on campus
          </p>
        </div>

        <Link
          href="/clubs"
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          <Users className="mr-1.5 h-4 w-4" />
          Browse Directory
        </Link>
      </div>

      {memberships.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No joined clubs yet"
          description="You haven't joined any college organizations yet. Explore the campus directory and submit join requests."
          action={{
            label: "Explore Clubs",
            href: "/clubs",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {memberships.map((m) => (
            <Card
              key={m.id}
              className="flex flex-col justify-between overflow-hidden border-border/70 hover:border-primary/50 transition-all bg-card/80"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {m.club.logoUrl ? (
                      <img
                        src={m.club.logoUrl}
                        alt={m.club.name}
                        className="w-12 h-12 rounded-xl object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        {m.club.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base line-clamp-1">
                        {m.club.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {m.club.category || "Student Group"}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={m.role === "LEAD" ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {m.role}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pb-4">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {m.club.description || "No description provided."}
                </p>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant={
                      m.status === "APPROVED"
                        ? "outline"
                        : m.status === "PENDING"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-[10px]"
                  >
                    {m.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Joined:</span>
                  <span>{formatDate(new Date(m.joinedAt))}</span>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/50">
                <Link
                  href={`/clubs/${m.club.slug}`}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                    className: "w-full justify-between text-xs font-semibold",
                  })}
                >
                  <span>Go to Club Page</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
