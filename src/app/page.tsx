import Link from "next/link";
import { getSession } from "@/lib/auth/get-session";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { StudentPassCard } from "@/components/shared/student-pass-card";
import { DragonParticles } from "@/components/shared/dragon-particles";
import {
  Sparkles,
  Users,
  Calendar,
  QrCode,
  ShieldCheck,
  ArrowRight,
  Zap,
  Radio,
  Flame,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden selection:bg-primary selection:text-white">
      {/* Ambient Rising Embers Particles */}
      <DragonParticles />

      {/* Tactical Top Navigation */}
      <header className="sticky top-0 z-50 bg-black/85 backdrop-blur-xl border-b border-primary/25 shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-[0_0_16px_#f00010] transition-transform group-hover:scale-105">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold text-xl tracking-wider uppercase text-white">
              Campus<span className="text-primary group-hover:drop-shadow-[0_0_10px_#f00010]">Connect</span>
            </span>
          </Link>

          {/* Tactical Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_16px_rgba(240,0,16,0.15)]">
            <span className="pulse-dot" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              CAMPUS RADAR // <span className="text-white font-semibold">ONLINE</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Link
                href="/home"
                className="font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-md bg-primary text-white font-bold border border-rose-400 shadow-[0_0_20px_rgba(240,0,16,0.6)] hover:bg-[#ff1a2b] transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-mono text-xs uppercase tracking-wider px-3.5 py-2 rounded-md border border-primary/30 bg-primary/10 hover:border-primary text-white transition-all hover:shadow-[0_0_14px_rgba(240,0,16,0.3)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded-md bg-primary text-white font-bold border border-rose-400 shadow-[0_0_22px_rgba(240,0,16,0.65)] hover:bg-[#ff1a2b] transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
                >
                  Join Portal <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Live System Broadcast Ticker Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-black to-primary/20 border-b border-dashed border-primary/40 py-2.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-xs font-mono tracking-wider uppercase text-rose-200">
          <span className="pulse-dot" />
          <span className="text-primary font-bold">// SYSTEM BROADCAST:</span>
          <span>Annual College Hackathon registrations & Club recruitment are now open!</span>
          <Link
            href="/events"
            className="hidden sm:inline-flex items-center gap-1 text-white underline font-semibold hover:text-primary transition-colors ml-1"
          >
            Explore Events &rarr;
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Badges, CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Monospace Subtitle Tag */}
              <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground border border-primary/30 bg-primary/10 px-3.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(240,0,16,0.2)]">
                <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>// OFFICIAL STUDENT ECOSYSTEM // VERIFIED ACCESS</span>
              </div>

              {/* Bold Oswald Headline */}
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[0.95]">
                CAMPUS SOCIETIES <br />
                <span className="text-crimson-gradient">RECHARGED & CONNECTED.</span>
              </h1>

              {/* Body Paragraph */}
              <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                The unified digital backbone for college life. Discover student clubs, register for hackathons and esports tournaments, gain instant entry via encrypted QR passes, and track verified campus credentials.
              </p>

              {/* Tactical Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "// FAST QR TICKETING",
                  "// SMART WAITLIST",
                  "// ROLE SECURITY",
                  "// LIVE ATTENDANCE",
                  "// VERIFIED PASSES",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-md bg-[#0d0103] border border-primary/30 text-rose-200/90 shadow-[inset_0_1px_0_rgba(240,0,16,0.2)] hover:border-primary hover:shadow-[0_0_14px_rgba(240,0,16,0.35)] transition-all cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Hero Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                {user ? (
                  <Link
                    href="/home"
                    className="font-mono text-sm uppercase tracking-wider px-6 py-3.5 rounded-md bg-primary text-white font-bold border border-rose-400 shadow-[0_0_30px_rgba(240,0,16,0.7),0_10px_24px_-10px_rgba(0,0,0,0.9)] hover:bg-[#ff1a2b] hover:shadow-[0_0_40px_rgba(240,0,16,0.9)] transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5"
                  >
                    Enter Student Terminal <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="font-mono text-sm uppercase tracking-wider px-6 py-3.5 rounded-md bg-primary text-white font-bold border border-rose-400 shadow-[0_0_30px_rgba(240,0,16,0.7),0_10px_24px_-10px_rgba(0,0,0,0.9)] hover:bg-[#ff1a2b] hover:shadow-[0_0_40px_rgba(240,0,16,0.9)] transition-all flex items-center justify-center gap-3 hover:-translate-y-0.5"
                    >
                      Join with College Email <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/login"
                      className="font-mono text-sm uppercase tracking-wider px-6 py-3.5 rounded-md border border-primary/40 bg-primary/10 hover:border-primary hover:bg-primary/20 text-white shadow-[inset_0_1px_0_rgba(240,0,16,0.2)] hover:shadow-[0_0_22px_rgba(240,0,16,0.45)] transition-all flex items-center justify-center gap-2"
                    >
                      Instant Demo Login
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: 3D Holographic Pass Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <StudentPassCard
                name={user?.name || "Liam Johnson"}
                role={user?.role?.replace("_", " ") || "Verified Student"}
                department={user?.department || "Computer Science & Eng"}
                year={user?.year || "2026"}
                studentId="CC-84920-CS"
              />
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground text-center mt-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-primary" /> Hover over student pass for holographic 3D tilt
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tactical Stats Grid from index.html */}
      <section className="py-12 border-y border-primary/25 bg-[#070102]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                number: "24+",
                unit: "CLUBS",
                label: "Student Societies & Chapters",
              },
              {
                number: "1,200+",
                unit: "USERS",
                label: "Registered Campus Members",
              },
              {
                number: "< 1.5s",
                unit: "FAST",
                label: "QR Scanner Verification Time",
              },
              {
                number: "100%",
                unit: "SECURE",
                label: "Role-Based Cryptographic Access",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="tactical-card p-5 sm:p-6 rounded-2xl relative group overflow-hidden"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight group-hover:text-primary transition-colors">
                    {stat.number}
                  </span>
                  <span className="font-mono text-[11px] text-primary font-bold uppercase tracking-widest">
                    {stat.unit}
                  </span>
                </div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Section (inspired by .lan / .star in index.html) */}
      <section className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 border-b border-primary/20 pb-6">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-primary flex items-center gap-1.5 mb-2">
                <Zap className="w-4 h-4" /> // SYSTEM CAPABILITIES
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
                Engineered for High-Output Campus Operations
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground max-w-md">
              From freshman discovery to high-stakes hackathon coordination, CampusConnect replaces fragmented spreadsheets with an authoritative platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bento Card 1 */}
            <div className="tactical-card p-6 rounded-2xl flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shadow-[0_0_16px_rgba(240,0,16,0.3)] group-hover:scale-105 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                    // 01 ARCHITECTURE
                  </span>
                  <h3 className="font-heading font-bold text-xl uppercase tracking-wide text-white">
                    Club Directories
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Categorized societies with member rosters, officer hierarchies, and automated application approval workflows.
                </p>
              </div>
              <div className="pt-4 border-t border-primary/20 font-mono text-xs text-rose-300/80 flex items-center justify-between">
                <span>STATUS: OPERATIONAL</span>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="tactical-card p-6 rounded-2xl flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shadow-[0_0_16px_rgba(240,0,16,0.3)] group-hover:scale-105 transition-transform">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                    // 02 AUTOMATION
                  </span>
                  <h3 className="font-heading font-bold text-xl uppercase tracking-wide text-white">
                    Smart Waitlists
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Capacity management that automatically promotes waitlisted students when someone cancels, preventing empty seats.
                </p>
              </div>
              <div className="pt-4 border-t border-primary/20 font-mono text-xs text-rose-300/80 flex items-center justify-between">
                <span>STATUS: OPERATIONAL</span>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="tactical-card p-6 rounded-2xl flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shadow-[0_0_16px_rgba(240,0,16,0.3)] group-hover:scale-105 transition-transform">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                    // 03 FAST SCAN
                  </span>
                  <h3 className="font-heading font-bold text-xl uppercase tracking-wide text-white">
                    Encrypted QR Passes
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Hardware-accelerated camera check-in with tamper-proof signatures, duplicate detection, and live attendance CSV export.
                </p>
              </div>
              <div className="pt-4 border-t border-primary/20 font-mono text-xs text-rose-300/80 flex items-center justify-between">
                <span>STATUS: OPERATIONAL</span>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            </div>

            {/* Bento Card 4 */}
            <div className="tactical-card p-6 rounded-2xl flex flex-col justify-between space-y-4 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center shadow-[0_0_16px_rgba(240,0,16,0.3)] group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary font-semibold block mb-1">
                    // 04 SECURITY
                  </span>
                  <h3 className="font-heading font-bold text-xl uppercase tracking-wide text-white">
                    Three-Tier Security
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Strict authorization spanning Students, Club Officers, and Deans, secured with Supabase Auth and database policies.
                </p>
              </div>
              <div className="pt-4 border-t border-primary/20 font-mono text-xs text-rose-300/80 flex items-center justify-between">
                <span>STATUS: OPERATIONAL</span>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 border-t border-primary/25 bg-gradient-to-b from-black to-[#0d0103] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-rose-300 px-3.5 py-1.5 rounded-full border border-primary/40 bg-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>JOIN THE CAMPUS GRID TODAY</span>
          </div>

          <h2 className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            Ready to Experience Next-Gen Campus Life?
          </h2>

          <p className="max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base leading-relaxed">
            Create your account in under 60 seconds with your student email, join active clubs, and receive your digital fast-check-in event passes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="font-mono text-sm uppercase tracking-wider px-8 py-3.5 rounded-md bg-primary text-white font-bold border border-rose-400 shadow-[0_0_30px_rgba(240,0,16,0.7)] hover:bg-[#ff1a2b] transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="font-mono text-sm uppercase tracking-wider px-8 py-3.5 rounded-md border border-primary/40 bg-primary/10 text-white hover:border-primary hover:bg-primary/20 transition-all"
            >
              Browse as Guest
            </Link>
          </div>
        </div>
      </section>

      {/* Tactical Footer */}
      <footer className="mt-auto border-t border-primary/20 bg-[#030001] py-8 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="pulse-dot" />
            <span className="uppercase tracking-wider">
              CAMPUS CONNECT // ALL SYSTEMS OPERATIONAL
            </span>
          </div>

          <p className="text-center sm:text-right uppercase tracking-wider">
            © {new Date().getFullYear()} CampusConnect. Inspired by Ravonixx Tactical Design.
          </p>
        </div>
      </footer>
    </div>
  );
}
