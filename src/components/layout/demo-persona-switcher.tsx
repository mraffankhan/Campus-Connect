"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ChevronDown,
  GraduationCap,
  ShieldAlert,
  Wrench,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { switchDemoUser } from "@/actions/auth";
import { toast } from "sonner";

interface DemoPersonaSwitcherProps {
  currentUserId?: string;
  currentRole?: string;
  currentName?: string;
}

const PRIMARY_PERSONAS = [
  {
    id: "user-student-1",
    name: "Liam Johnson",
    email: "liam.j@college.edu",
    role: "STUDENT",
    title: "Freshman Student",
    icon: GraduationCap,
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    desc: "Browse clubs, register, view QR pass",
  },
  {
    id: "user-club-admin-1",
    name: "Sarah Chen",
    email: "sarah.chen@college.edu",
    role: "CLUB_ADMIN",
    title: "ACM Chapter Lead",
    icon: Wrench,
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    desc: "Club admin desk, events & QR scanner",
  },
  {
    id: "user-super-admin",
    name: "Dr. Evelyn Vance",
    email: "dean@college.edu",
    role: "SUPER_ADMIN",
    title: "Dean of Student Affairs",
    icon: ShieldAlert,
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    desc: "Approve clubs, broadcasts, full analytics",
  },
];

const OTHER_STUDENTS = [
  { id: "user-student-2", name: "Emma Watson", role: "STUDENT", dept: "CS (Yr 2)" },
  { id: "user-student-3", name: "Noah Williams", role: "STUDENT", dept: "EE (Yr 1, Waitlist demo)" },
  { id: "user-student-4", name: "Olivia Brown", role: "STUDENT", dept: "MechE (Yr 3)" },
  { id: "user-club-admin-2", name: "Marcus Miller", role: "CLUB_ADMIN", dept: "Robotics Lead" },
  { id: "user-club-admin-3", name: "Priya Sharma", role: "CLUB_ADMIN", dept: "Arts Lead" },
];

export function DemoPersonaSwitcher({
  currentUserId,
  currentRole,
  currentName,
}: DemoPersonaSwitcherProps) {
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async (userId: string, name: string) => {
    setIsSwitching(true);
    try {
      const res = await switchDemoUser(userId);
      if (res.success) {
        toast.success(`Switched persona to ${name}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to switch persona");
      }
    } catch {
      toast.error("Error switching persona");
    } finally {
      setIsSwitching(false);
    }
  };

  const activePersona = PRIMARY_PERSONAS.find((p) => p.id === currentUserId) || {
    name: currentName || "Demo User",
    role: currentRole || "STUDENT",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            disabled={isSwitching}
            className="h-8 gap-1.5 px-2.5 text-xs font-medium border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 transition-all rounded-full"
            id="demo-persona-switcher"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="hidden sm:inline text-muted-foreground">Demo:</span>
            <span className="font-semibold text-foreground max-w-[120px] truncate">
              {activePersona.name.split(" ")[0]}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 uppercase font-mono tracking-wider border-primary/20 bg-background/50"
            >
              {activePersona.role.replace("_", " ")}
            </Badge>
            <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60 ml-0.5" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-80 p-2 shadow-2xl">
        <DropdownMenuLabel className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Switch Demo Persona
            </span>
            <Badge variant="secondary" className="text-[10px]">
              Instant Frontend Mode
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
            Test role permissions, waitlist mechanics, and admin tools in one click.
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup className="space-y-1">
          {PRIMARY_PERSONAS.map((persona) => {
            const Icon = persona.icon;
            const isCurrent = currentUserId === persona.id;

            return (
              <DropdownMenuItem
                key={persona.id}
                onClick={() => handleSwitch(persona.id, persona.name)}
                className={`p-2.5 rounded-lg cursor-pointer flex items-start gap-3 transition-colors ${
                  isCurrent ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                }`}
              >
                <div
                  className={`p-2 rounded-lg border ${persona.badgeColor} shrink-0 mt-0.5`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {persona.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1 py-0 uppercase border font-mono ${persona.badgeColor}`}
                    >
                      {persona.role.replace("_", " ")}
                    </Badge>
                    {isCurrent && <Check className="h-3 w-3 text-primary ml-auto" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{persona.title}</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                    {persona.desc}
                  </p>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Users className="h-3 w-3" /> More Demo Personas
        </DropdownMenuLabel>

        <div className="max-h-36 overflow-y-auto space-y-0.5">
          {OTHER_STUDENTS.map((student) => {
            const isCurrent = currentUserId === student.id;
            return (
              <DropdownMenuItem
                key={student.id}
                onClick={() => handleSwitch(student.id, student.name)}
                className={`px-2 py-1.5 text-xs rounded-md cursor-pointer flex items-center justify-between ${
                  isCurrent ? "bg-primary/10 font-medium" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate">{student.name}</span>
                  <span className="text-[10px] text-muted-foreground">({student.dept})</span>
                </div>
                {isCurrent && <Check className="h-3 w-3 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
