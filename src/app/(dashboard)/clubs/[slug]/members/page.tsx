import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { MemberTable } from "@/components/clubs/member-table";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft, Users, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface ClubMembersPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClubMembersPage({ params }: ClubMembersPageProps) {
  const user = await requireSession();
  const { slug } = await params;

  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              department: true,
              year: true,
            },
          },
        },
        orderBy: [{ status: "asc" }, { role: "desc" }, { joinedAt: "asc" }],
      },
    },
  });

  if (!club) {
    notFound();
  }

  const currentUserMembership = club.memberships.find((m) => m.userId === user.id);
  const isClubAdmin =
    user.role === "SUPER_ADMIN" ||
    (currentUserMembership?.status === "APPROVED" &&
      ["LEAD", "COORDINATOR"].includes(currentUserMembership.role));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href={`/clubs/${club.slug}`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "text-muted-foreground -ml-2",
          })}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {club.name}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              <span>{club.name} – Members</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isClubAdmin
                ? "Review pending join requests, manage member roles, or remove members."
                : "Active student members and coordinators of this organization."}
            </p>
          </div>
        </div>
      </div>

      <MemberTable
        members={club.memberships as any}
        isClubAdmin={isClubAdmin}
        currentUserId={user.id}
      />
    </div>
  );
}
