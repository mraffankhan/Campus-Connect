import Link from "next/link";
import { Calendar, Clock, MapPin, Users, ArrowRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/25 bg-[#090102] hover:border-primary transition-all duration-300 hover:shadow-[0_0_28px_rgba(240,0,16,0.35)] shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(240,0,16,0.15)]">
      {/* Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-black">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1c0205] to-[#090102] flex items-center justify-center text-primary/30">
            <Calendar className="h-16 w-16" />
          </div>
        )}

        {/* Club Chip */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/85 text-white border border-primary/40 backdrop-blur-md shadow-[0_0_10px_rgba(240,0,16,0.25)] font-semibold">
            {event.club.name}
          </span>
          {event.isMembersOnly && (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-primary text-white border border-rose-300 backdrop-blur-md flex items-center gap-1 font-bold">
              <Lock className="h-3 w-3" /> Members Only
            </span>
          )}
        </div>

        {/* Status Chip */}
        <div className="absolute top-3 right-3">
          {isCancelled ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary/30 text-rose-300 border border-primary font-bold">
              CANCELLED
            </span>
          ) : isPast ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/80 text-muted-foreground border border-white/20">
              PAST EVENT
            </span>
          ) : isRegistered ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-primary text-white font-bold border border-rose-300 shadow-[0_0_12px_#f00010] flex items-center gap-1.5">
              <span className="pulse-dot" /> CONFIRMED
            </span>
          ) : isFull ? (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
              WAITLIST ONLY
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/80 text-rose-200 border border-primary/40">
              OPEN ACCESS
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h3 className="font-heading font-bold text-lg uppercase tracking-wide text-white line-clamp-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {event.description || "No description provided."}
          </p>
        </div>

        <div className="space-y-2 pt-2 text-xs font-mono text-muted-foreground border-t border-primary/15">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-white/90">
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
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                {confirmedCount} / {event.capacity} seats reserved
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-3 bg-black/40 border-t border-primary/20">
        <Link
          href={`/events/${event.id}`}
          className="w-full font-mono text-xs uppercase tracking-wider font-bold py-2 px-3 rounded-lg flex items-center justify-between text-rose-200 hover:text-white hover:bg-primary transition-all group/btn"
        >
          <span>View Event Details &rarr;</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
