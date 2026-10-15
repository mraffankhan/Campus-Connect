import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  Sparkles,
  Users,
  Calendar,
  QrCode,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gradient">
              CampusConnect
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href="/home"
                className={buttonVariants({ size: "sm" })}
              >
                Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({ size: "sm" })}
                >
                  Join Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wide uppercase">
            <GraduationCap className="h-4 w-4" />
            <span>The Official College Club & Event Hub</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
            Your Campus Life, <br />
            <span className="text-gradient">All Connected in One Place.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-muted-foreground leading-relaxed">
            Discover student clubs, register for hackathons and workshops, track event attendance via QR codes, and never miss an official announcement.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            {user ? (
              <Link
                href="/home"
                className={buttonVariants({
                  size: "lg",
                  className: "w-full sm:w-auto font-medium",
                })}
              >
                Go to Student Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className={buttonVariants({
                    size: "lg",
                    className: "w-full sm:w-auto font-medium shadow-lg shadow-primary/25",
                  })}
                >
                  Get Started with College Email <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full sm:w-auto",
                  })}
                >
                  Sign In to Account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 border-t border-border/60 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for Students, Club Admins & Campus Leaders
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              A comprehensive platform streamlining college engagement and attendance tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-card/70 backdrop-blur-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Club Directories</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Browse student societies by category, submit join requests, and follow club leadership.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card/70 backdrop-blur-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Smart Registrations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Capacity management with automated waitlist promotion when a student cancels.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card/70 backdrop-blur-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">QR Fast Check-in</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Signed QR tickets with instant scanning for club admins and downloadable attendance reports.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card/70 backdrop-blur-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Role Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Three-tier permission model backed by Supabase RLS and server action authorization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CampusConnect. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with Next.js, Supabase, Prisma & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
