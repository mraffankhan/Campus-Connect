import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/get-session";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatDate } from "@/lib/utils";
import { User, CheckCircle2, Heart, Calendar } from "lucide-react";

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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal details and view your campus engagement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <Card className="flex flex-col items-center p-6 text-center space-y-4">
          <Avatar className="h-24 w-24 border-2 border-primary/20">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="text-xs mt-1">
              {user.role.replace("_", " ")}
            </Badge>
          </div>

          <div className="w-full pt-4 border-t border-border/60 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-muted/40 text-center">
              <p className="font-bold text-lg text-primary">{turnoutRate}%</p>
              <p className="text-[11px] text-muted-foreground">Attendance</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 text-center">
              <p className="font-bold text-lg text-primary">{memberships.length}</p>
              <p className="text-[11px] text-muted-foreground">Clubs Joined</p>
            </div>
          </div>
        </Card>

        {/* Right 2 Columns: Edit Details & Clubs */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Academic Information</CardTitle>
              <CardDescription>Update your department and current study year</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialDepartment={user.department}
                initialYear={user.year}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Clubs & Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {memberships.length === 0 ? (
                <p className="text-xs text-muted-foreground">You have not joined any clubs yet.</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {memberships.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-sm">{m.club.name}</p>
                        <p className="text-muted-foreground">{m.club.category || "General"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={m.role === "LEAD" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {m.role}
                        </Badge>
                        <Badge
                          variant={m.status === "APPROVED" ? "outline" : "secondary"}
                          className="text-[10px]"
                        >
                          {m.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
