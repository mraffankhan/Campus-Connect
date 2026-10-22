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
  Radio,
  Lock,
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
import { DragonParticles } from "@/components/shared/dragon-particles";

const QUICK_DEMO_USERS = [
  {
    id: "user-student-1",
    name: "Liam Johnson",
    email: "liam.j@college.edu",
    role: "STUDENT",
    title: "Student (Freshman)",
    description: "Browse clubs, register for events, view QR tickets",
    icon: GraduationCap,
    badgeColor: "border-primary/40 text-rose-300 bg-primary/15",
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
    badgeColor: "border-primary/40 text-rose-300 bg-primary/15",
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
    badgeColor: "border-primary/60 text-white bg-primary/30",
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

      toast.success("Welcome back to CampusConnect!");
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
        toast.success(`Authenticated as ${name}!`);
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <DragonParticles />

      {/* Volcanic Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="tactical-card p-6 sm:p-8 rounded-2xl border-2 border-primary/40 bg-[#090102]/95 backdrop-blur-2xl shadow-[0_0_50px_rgba(240,0,16,0.35),0_30px_60px_-15px_rgba(0,0,0,0.9)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_#f00010]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary px-3 py-1 rounded-full border border-primary/30 bg-primary/10">
              <Radio className="w-3 h-3 text-primary animate-pulse" />
              <span>// AUTHENTICATION TERMINAL</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
              Campus<span className="text-primary">Connect</span>
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              Select an instant 1-click test persona or sign in with credentials
            </p>
          </div>

          {/* 1-Click Demo Personas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Instant 1-Click Personas
              </span>
              <span className="text-primary text-[10px]">[TEST PASS]</span>
            </div>

            <div className="space-y-2.5">
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
                    className="w-full text-left p-3.5 rounded-xl border border-primary/25 bg-[#0e0204] hover:bg-primary/15 hover:border-primary transition-all flex items-center justify-between group cursor-pointer shadow-[inset_0_1px_0_rgba(240,0,16,0.15)] hover:shadow-[0_0_20px_rgba(240,0,16,0.3)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg border ${demo.badgeColor} flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(240,0,16,0.25)]`}
                      >
                        {isSelected ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold uppercase text-sm text-white group-hover:text-primary transition-colors truncate">
                            {demo.name}
                          </span>
                          <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border border-primary/40 bg-primary/20 text-rose-200">
                            {demo.role.replace("_", " ")}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground truncate">{demo.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-primary/25 w-full" />
            <span className="bg-[#090102] px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0 font-bold">
              // OR EMAIL CREDENTIALS //
            </span>
            <div className="border-t border-primary/25 w-full" />
          </div>

          {/* Standard Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3 text-xs font-mono rounded-lg bg-primary/15 border border-primary/40 text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                College Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="student@college.edu"
                autoComplete="email"
                disabled={isLoading || demoLoadingId !== null}
                className="bg-[#0e0204] border-primary/30 text-white font-mono text-xs focus-visible:border-primary focus-visible:ring-primary shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs font-mono text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading || demoLoadingId !== null}
                className="bg-[#0e0204] border-primary/30 text-white font-mono text-xs focus-visible:border-primary focus-visible:ring-primary shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs font-mono text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-mono text-xs uppercase tracking-wider h-11 bg-primary text-white font-bold border border-rose-400 shadow-[0_0_24px_rgba(240,0,16,0.65)] hover:bg-[#ff1a2b] transition-all cursor-pointer"
              disabled={isLoading || demoLoadingId !== null}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  SIGN IN TO GRID <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-2 text-center border-t border-primary/20">
            <p className="font-mono text-xs text-muted-foreground">
              Need a campus account?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Register student pass &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
