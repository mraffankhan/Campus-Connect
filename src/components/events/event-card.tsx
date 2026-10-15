import Link from "next/link";
import { Calendar, Clock, MapPin, Users, ArrowRight, Lock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import type { EventWithClub } from "@/types";

interface EventCardProps {
  event: EventWithClub;
  isRegistered?: boolean;
}

export function EventCard({ event, isRegistered }: EventCardProps) {
  const isCancelled = event.status === "CANCELLED";
  const isPast = new Date(event.endsAt) < new Date();
  const confirmedCount = event._count?.registrations ?? 0;
  const isFull = event.capacity !== null && event.capacity !== undefined && confirmedCount >= event.capacity;

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-border/70 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/80 backdrop-blur-sm">
      {/* Banner */}
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full gradient-primary opacity-85 flex items-center justify-center text-white/30">
            <Calendar className="h-16 w-16" />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-[10px] font-semibold">
            {event.club.name}
          </Badge>
          {event.isMembersOnly && (
            <Badge variant="default" className="backdrop-blur-md text-[10px] gap-1 bg-amber-600 hover:bg-amber-600">
              <Lock className="h-3 w-3" /> Members Only
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3">
          {isCancelled ? (
            <Badge variant="destructive" className="text-[10px]">
              Cancelled
            </Badge>
          ) : isPast ? (
            <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-[10px]">
              Past Event
            </Badge>
          ) : isRegistered ? (
            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-[10px]">
              Registered
            </Badge>
          ) : isFull ? (
            <Badge variant="secondary" className="backdrop-blur-md bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px]">
              Waitlist Only
            </Badge>
          ) : (
            <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-[10px]">
              Open
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="space-y-1.5 pb-2">
        <h3 className="font-bold text-base line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {event.description || "No description provided."}
        </p>
      </CardHeader>

      <CardContent className="space-y-2 pb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-medium">
            {formatDate(new Date(event.startsAt))} • {formatTime(new Date(event.startsAt))}
          </span>
        </div>

        {event.venue && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        )}

        {event.capacity && (
          <div className="flex items-center gap-2 pt-1">
            <Users className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              {confirmedCount} / {event.capacity} spots filled
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t border-border/50">
        <Link
          href={`/events/${event.id}`}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "w-full justify-between text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-all",
          })}
        >
          <span>View Event & Register</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </CardFooter>
    </Card>
  );
}
