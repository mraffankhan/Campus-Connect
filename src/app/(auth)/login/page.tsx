"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  GraduationCap,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { login, switchDemoUser } from "@/actions/auth";
import { toast } from "sonner";

const QUICK_DEMO_USERS = [
  {
    id: "user-student-1",
    name: "Liam Johnson",
    email: "liam.j@college.edu",
    role: "STUDENT",
    title: "Student (Freshman)",
    description: "Browse clubs, register for events, view QR tickets",
    icon: GraduationCap,
    badgeColor: "border-blue-500/30 text-blue-500 bg-blue-500/10",
    destination: "/home",
  },
  {
    id: "user-club-admin-1",
    name: "Sarah Chen",
    email: "sarah.chen@college.edu",
    role: "CLUB_ADMIN",
    title: "Club Admin (ACM Chapter)",
    description: "Manage members, create events, camera QR scanner",
    icon: Wrench,
    badgeColor: "border-amber-500/30 text-amber-500 bg-amber-500/10",
    destination: "/clubs/acm-student-chapter",
  },
  {
    id: "user-super-admin",
    name: "Dr. Evelyn Vance",
    email: "dean@college.edu",
    role: "SUPER_ADMIN",
    title: "Super Admin (Dean)",
    description: "Approve clubs, college broadcasts, system metrics",
    icon: ShieldAlert,
    badgeColor: "border-rose-500/30 text-rose-500 bg-rose-500/10",
    destination: "/admin",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingId, setDemoLoadingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "liam.j@college.edu",
      password: "password123",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await login(values);
      if (!res.success) {
        setServerError(res.error);
        toast.error(res.error);
        return;
      }

      toast.success("Welcome back!");
      router.push("/home");
      router.refresh();
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (
    userId: string,
    name: string,
    email: string,
    dest: string
  ) => {
    setDemoLoadingId(userId);
    setValue("email", email);
    setValue("password", "password123");

    try {
      const res = await switchDemoUser(userId);
      if (res.success) {
        toast.success(`Logged in as ${name}!`);
        router.push(dest);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to switch persona");
      }
    } catch {
      toast.error("Failed to login as demo user");
    } finally {
      setDemoLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial-[at_top_right] from-primary/10 via-background to-background relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-lg border-border/60 shadow-xl backdrop-blur-xl bg-card/85 relative z-10 my-8">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="flex justify-center mb-1">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Welcome to <span className="text-gradient">CampusConnect</span>
          </CardTitle>
          <CardDescription>
            Select a demo persona to test instantly in the browser with full features
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* ─── One-Click Quick Demo Personas ──────────────────────────── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Instant 1-Click Personas
              </span>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                Ready to explore
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {QUICK_DEMO_USERS.map((demo) => {
                const Icon = demo.icon;
                const isSelected = demoLoadingId === demo.id;

                return (
                  <button
                    key={demo.id}
                    type="button"
                    disabled={isLoading || demoLoadingId !== null}
                    onClick={() =>
                      handleQuickDemoLogin(demo.id, demo.name, demo.email, demo.destination)
                    }
                    className="w-full text-left p-3 rounded-xl border border-border/80 bg-background/60 hover:bg-primary/5 hover:border-primary/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg border ${demo.badgeColor} flex items-center justify-center shrink-0`}
                      >
                        {isSelected ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                            {demo.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 uppercase font-mono ${demo.badgeColor}`}
                          >
                            {demo.role.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{demo.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground shrink-0 font-medium">
              Or sign in with email
            </span>
            <div className="border-t border-border w-full" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">College Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@college.edu"
                autoComplete="email"
                disabled={isLoading || demoLoadingId !== null}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading || demoLoadingId !== null}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-medium"
              disabled={isLoading || demoLoadingId !== null}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In with Credentials <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-0">
          <p className="text-xs text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Create student account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
