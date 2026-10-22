import Link from "next/link";
import { Users, Calendar, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import type { ClubWithCounts } from "@/types";

interface ClubCardProps {
  club: ClubWithCounts;
}

export function ClubCard({ club }: ClubCardProps) {
  const isSuspended = club.status === "SUSPENDED";
  const isPending = club.status === "PENDING";

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-primary/25 bg-[#090102] hover:border-primary transition-all duration-300 hover:shadow-[0_0_28px_rgba(240,0,16,0.35)] shadow-[0_8px_24px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(240,0,16,0.15)]">
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {club.logoUrl ? (
              <img
                src={club.logoUrl}
                alt={club.name}
                className="w-12 h-12 rounded-xl object-cover border border-primary/40 shadow-[0_0_12px_rgba(240,0,16,0.25)]"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[#80000a] flex items-center justify-center text-white font-heading font-extrabold text-xl shadow-[0_0_14px_rgba(240,0,16,0.4)] border border-rose-400/40">
                {club.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-heading font-bold text-lg uppercase tracking-wide text-white line-clamp-1 group-hover:text-primary transition-colors">
                {club.name}
              </h3>
              <p className="font-mono text-[11px] uppercase tracking-wider text-rose-300/80">
                {club.category || "Student Society"}
              </p>
            </div>
          </div>

          {isSuspended ? (
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-rose-300 border border-primary font-bold">
              SUSPENDED
            </span>
          ) : isPending ? (
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PENDING
            </span>
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-rose-200 border border-primary/40 font-semibold flex items-center gap-1">
              <span className="pulse-dot" /> ACTIVE
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {club.description || "No description provided for this campus organization."}
        </p>

        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground pt-2 border-t border-primary/15">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            <strong className="text-white font-normal">{club._count?.memberships ?? 0}</strong> members
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <strong className="text-white font-normal">{club._count?.events ?? 0}</strong> events
          </span>
        </div>
      </div>

      <div className="p-3 bg-black/40 border-t border-primary/20">
        <Link
          href={`/clubs/${club.slug}`}
          className="w-full font-mono text-xs uppercase tracking-wider font-bold py-2 px-3 rounded-lg flex items-center justify-between text-rose-200 hover:text-white hover:bg-primary transition-all group/btn"
        >
          <span>View Society Roster &rarr;</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
