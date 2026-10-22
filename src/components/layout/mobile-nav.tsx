"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Calendar,
  Heart,
  CalendarCheck,
  Megaphone,
  LayoutDashboard,
  Building2,
  UserCog,
  Sparkles,
  X,
  Menu,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Users,
  Calendar,
  Heart,
  CalendarCheck,
  Megaphone,
  LayoutDashboard,
  Building2,
  UserCog,
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const studentNav: NavItem[] = [
  { label: "Home", href: "/home", icon: "Home" },
  { label: "Clubs", href: "/clubs", icon: "Users" },
  { label: "Events", href: "/events", icon: "Calendar" },
  { label: "My Clubs", href: "/my-clubs", icon: "Heart" },
  { label: "My Events", href: "/my-events", icon: "CalendarCheck" },
  { label: "Announcements", href: "/announcements", icon: "Megaphone" },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "LayoutDashboard" },
  { label: "Manage Clubs", href: "/admin/clubs", icon: "Building2" },
  { label: "Manage Users", href: "/admin/users", icon: "UserCog" },
  { label: "Announcements", href: "/admin/announcements", icon: "Megaphone" },
];

interface MobileNavProps {
  role: string;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems =
    role === "SUPER_ADMIN" ? [...studentNav, ...adminNav] : studentNav;

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/20 hover:border-primary text-white"
            id="mobile-nav-trigger"
          >
            <Menu className="h-5 w-5 text-primary" />
            <span className="sr-only">Open navigation</span>
          </Button>
        }
      />
      <SheetContent side="left" className="w-[280px] p-0 bg-[#050001] border-r border-primary/25 text-white">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-primary/20 bg-black/50">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shadow-[0_0_12px_#f00010]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-heading font-bold text-lg tracking-wider uppercase text-white">
              Campus<span className="text-primary">Connect</span>
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-primary/20"
            onClick={() => setOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="py-4 px-3 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
            // MAIN GRID
          </p>
          {navItems.map((item, index) => {
            const Icon = iconMap[item.icon] || Home;
            const active = isActive(item.href);

            // Add separator before admin section
            if (role === "SUPER_ADMIN" && index === studentNav.length) {
              return (
                <div key="separator" className="pt-2">
                  <Separator className="my-3 bg-primary/20" />
                  <p className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest mb-2 px-3">
                    // ADMIN SYSTEM
                  </p>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-primary/20 text-white font-semibold border-l-2 border-primary shadow-[0_0_16px_rgba(240,0,16,0.3)]"
                        : "text-white/70 hover:bg-primary/10 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/20 text-white font-semibold border-l-2 border-primary shadow-[0_0_16px_rgba(240,0,16,0.3)]"
                    : "text-white/70 hover:bg-primary/10 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
