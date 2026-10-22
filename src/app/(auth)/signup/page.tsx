"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, ArrowRight, Loader2, AlertCircle, CheckCircle2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupSchema, type SignupInput } from "@/schemas/auth";
import { signup } from "@/actions/auth";
import { toast } from "sonner";
import { DragonParticles } from "@/components/shared/dragon-particles";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await signup(values);
      if (!res.success) {
        setServerError(res.error);
        toast.error(res.error);
        return;
      }

      setIsSuccess(true);
      toast.success("Account created successfully!");
      setTimeout(() => {
        router.push("/complete-profile");
        router.refresh();
      }, 1500);
    } catch {
      setServerError("An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <DragonParticles />

      {/* Volcanic Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 my-8">
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
              <span>// RECRUITMENT REGISTRY</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
              Create Student Pass
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              Register your college identity for club membership & event passes
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-4 py-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 text-primary border border-primary flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(240,0,16,0.5)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold text-xl uppercase text-white">Identity Created</h3>
              <p className="font-mono text-xs text-muted-foreground">
                Initializing student pass profile...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 text-xs font-mono rounded-lg bg-primary/15 border border-primary/40 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Full Student Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Liam Johnson"
                  disabled={isLoading}
                  className="bg-[#0e0204] border-primary/30 text-white font-mono text-xs focus-visible:border-primary focus-visible:ring-primary shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs font-mono text-rose-400">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  College Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="liam.j@college.edu"
                  autoComplete="email"
                  disabled={isLoading}
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
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-[#0e0204] border-primary/30 text-white font-mono text-xs focus-visible:border-primary focus-visible:ring-primary shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs font-mono text-rose-400">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="bg-[#0e0204] border-primary/30 text-white font-mono text-xs focus-visible:border-primary focus-visible:ring-primary shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs font-mono text-rose-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-mono text-xs uppercase tracking-wider h-11 bg-primary text-white font-bold border border-rose-400 shadow-[0_0_24px_rgba(240,0,16,0.65)] hover:bg-[#ff1a2b] transition-all cursor-pointer mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    CREATING PASS...
                  </>
                ) : (
                  <>
                    CREATE STUDENT PASS <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="pt-2 text-center border-t border-primary/20">
                <p className="font-mono text-xs text-muted-foreground">
                  Already registered?{" "}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Sign in to account &rarr;
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
