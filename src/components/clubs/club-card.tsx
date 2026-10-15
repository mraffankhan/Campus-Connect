import Link from "next/link";
import { Users, Calendar, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { ClubWithCounts } from "@/types";

interface ClubCardProps {
  club: ClubWithCounts;
}

export function ClubCard({ club }: ClubCardProps) {
  const isSuspended = club.status === "SUSPENDED";
  const isPending = club.status === "PENDING";

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-border/70 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {club.logoUrl ? (
              <img
                src={club.logoUrl}
                alt={club.name}
                className="w-12 h-12 rounded-xl object-cover border border-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {club.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
                {club.name}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {club.category || "Student Organization"}
              </p>
            </div>
          </div>

          {isSuspended ? (
            <Badge variant="destructive" className="text-[10px]">
              Suspended
            </Badge>
          ) : isPending ? (
            <Badge variant="secondary" className="text-[10px]">
              Pending Approval
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {club.description || "No description provided for this campus organization."}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="h-3.5 w-3.5 text-primary" />
            {club._count?.memberships ?? 0} members
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            {club._count?.events ?? 0} events
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between">
        <Link
          href={`/clubs/${club.slug}`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "w-full justify-between text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all",
          })}
        >
          <span>View Club Profile</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
