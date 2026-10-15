import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { JoinButton } from "@/components/clubs/join-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Megaphone,
  Settings,
  ShieldCheck,
  PlusCircle,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatDate, formatTime, getInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ClubDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const user = await requireSession();
  const { slug } = await params;

  const club = await prisma.club.findUnique({
    where: { slug },
    include: {
      memberships: {
        where: { status: "APPROVED" },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true, department: true },
          },
        },
      },
      events: {
        where: { status: { in: ["PUBLISHED", "COMPLETED"] } },
        orderBy: { startsAt: "desc" },
        take: 5,
      },
      announcements: {
        orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      _count: {
        select: {
          memberships: { where: { status: "APPROVED" } },
          events: true,
        },
      },
    },
  });

  if (!club) {
    notFound();
  }

  // Check current user's membership in this club
  const userMembership = await prisma.membership.findUnique({
    where: {
      userId_clubId: { userId: user.id, clubId: club.id },
    },
  });

  const isClubAdmin =
    user.role === "SUPER_ADMIN" ||
    (userMembership?.status === "APPROVED" &&
      ["LEAD", "COORDINATOR"].includes(userMembership.role));

  const leads = club.memberships.filter((m) => ["LEAD", "COORDINATOR"].includes(m.role));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Club Header Banner */}
      <div className="relative rounded-2xl border border-border/80 p-6 sm:p-8 bg-card/70 backdrop-blur-md overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {club.logoUrl ? (
              <img
                src={club.logoUrl}
                alt={club.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-primary/20 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl gradient-primary flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-primary/20">
                {club.name.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-medium">
                  {club.category || "Student Club"}
                </Badge>
                {club.status === "ACTIVE" ? (
                  <Badge variant="secondary" className="text-xs text-emerald-600 dark:text-emerald-400">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    {club.status}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {club.name}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-primary" />
                  {club._count.memberships} approved members
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  {club._count.events} events
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <JoinButton clubId={club.id} membership={userMembership} />

            {isClubAdmin && (
              <Link
                href={`/clubs/${club.slug}/members`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Users className="mr-1.5 h-4 w-4" />
                Manage Members
              </Link>
            )}
          </div>
        </div>

        {/* Club Admin Fast Actions Bar */}
        {isClubAdmin && (
          <div className="mt-6 pt-4 border-t border-border/60 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-2 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Admin Controls:
            </span>
            <Link
              href={`/clubs/${club.slug}/events/new`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
              Create Event
            </Link>
            <Link
              href={`/clubs/${club.slug}/members`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Member Requests
            </Link>
          </div>
        )}
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: About, Events, Announcements */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About the Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {club.description || "No detailed description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Events by {club.name}</CardTitle>
                <CardDescription>Workshops, competitions, and general meetings</CardDescription>
              </div>
              {isClubAdmin && (
                <Link
                  href={`/clubs/${club.slug}/events/new`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  New Event
                </Link>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {club.events.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No events scheduled yet.
                </p>
              ) : (
                club.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{evt.title}</span>
                        {evt.isMembersOnly && (
                          <Badge variant="secondary" className="text-[10px]">
                            Members Only
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(new Date(evt.startsAt))} • {formatTime(new Date(evt.startsAt))}
                        </span>
                        {evt.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {evt.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/events/${evt.id}`}
                      className={buttonVariants({ size: "sm", variant: "secondary", className: "shrink-0" })}
                    >
                      Details
                    </Link>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Club Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {club.announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No announcements posted yet.
                </p>
              ) : (
                club.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl border border-border bg-card/60 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm">{ann.title}</h4>
                      {ann.pinned && (
                        <Badge variant="secondary" className="text-[10px]">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {ann.body}
                    </p>
                    <p className="text-[11px] text-muted-foreground pt-1">
                      Posted by {ann.author.name} • {formatDate(new Date(ann.createdAt))}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Leadership & Members Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Club Leadership</CardTitle>
              <CardDescription>Club leads and student coordinators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leads.length === 0 ? (
                <p className="text-xs text-muted-foreground">No leads assigned yet.</p>
              ) : (
                leads.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={m.user.avatarUrl || undefined} alt={m.user.name} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {getInitials(m.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{m.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.user.department || m.user.email}</p>
                    </div>
                    <Badge variant={m.role === "LEAD" ? "default" : "secondary"} className="text-[10px]">
                      {m.role}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Active Members ({club._count.memberships})</CardTitle>
                <Link
                  href={`/clubs/${club.slug}/members`}
                  className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs" })}
                >
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {club.memberships.slice(0, 12).map((m) => (
                  <Avatar key={m.id} className="h-8 w-8" title={m.user.name}>
                    <AvatarImage src={m.user.avatarUrl || undefined} alt={m.user.name} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {getInitials(m.user.name)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
