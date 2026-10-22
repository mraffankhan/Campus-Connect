import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { ProfileForm } from "@/components/profile/profile-form";
import { StudentPassCard } from "@/components/shared/student-pass-card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Flame, Radio } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireSession();

  const [memberships, attendances, confirmedRegs] = await Promise.all([
    prisma.membership.findMany({
      where: { userId: user.id },
      include: { club: true },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.attendance.count({ where: { userId: user.id } }),
    prisma.registration.count({ where: { userId: user.id, status: "CONFIRMED" } }),
  ]);

  const turnoutRate = confirmedRegs > 0 ? Math.round((attendances / confirmedRegs) * 100) : 100;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="pb-2 border-b border-primary/20">
        <div className="flex items-center gap-2 text-primary font-mono text-[11px] font-semibold uppercase tracking-wider mb-1">
          <span className="pulse-dot" />
          <span>STUDENT CREDENTIAL TERMINAL</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-white">
          Digital Student Pass & Profile
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-0.5">
          Authoritative campus pass, club leadership roles, and attendance credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive 3D Student ID Card from index.html */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <StudentPassCard
            name={user.name}
            role={user.role.replace("_", " ")}
            department={user.department || "General Engineering"}
            year={user.year || "2026"}
            studentId={`CC-${user.id.substring(user.id.length - 6).toUpperCase()}`}
          />

          {/* Quick Metrics Under Card */}
          <div className="w-full max-w-[340px] grid grid-cols-2 gap-3 mt-4">
            <div className="tactical-card p-3 rounded-xl text-center">
              <span className="font-heading font-extrabold text-2xl text-white block">
                {turnoutRate}%
              </span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                Attendance Rate
              </span>
            </div>
            <div className="tactical-card p-3 rounded-xl text-center">
              <span className="font-heading font-extrabold text-2xl text-white block">
                {memberships.length}
              </span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">
                Clubs Joined
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit Details & Club Roster */}
        <div className="lg:col-span-7 space-y-6">
          <div className="tactical-card p-6 rounded-2xl space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold block mb-1">
                // REGISTRATION DATA
              </span>
              <h2 className="font-heading font-bold text-xl uppercase tracking-wide text-white">
                Academic Information
              </h2>
              <p className="font-mono text-xs text-muted-foreground">
                Update your department discipline and projected graduation year
              </p>
            </div>

            <ProfileForm
              initialDepartment={user.department}
              initialYear={user.year}
            />
          </div>

          <div className="tactical-card p-6 rounded-2xl space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-bold block mb-1">
                // AFFILIATIONS
              </span>
              <h2 className="font-heading font-bold text-xl uppercase tracking-wide text-white">
                Active Club Memberships
              </h2>
            </div>

            {memberships.length === 0 ? (
              <p className="font-mono text-xs text-muted-foreground py-4 text-center">
                You have not joined any campus societies yet.
              </p>
            ) : (
              <div className="divide-y divide-primary/15 font-mono">
                {memberships.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-heading font-bold text-sm uppercase text-white">{m.club.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.club.category || "General Society"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded border border-primary/40 bg-primary/20 text-rose-200 font-bold">
                        {m.role}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
