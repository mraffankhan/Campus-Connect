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
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface SidebarProps {
  role: string;
  className?: string;
}

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

export function Sidebar({ role, className }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems =
    role === "SUPER_ADMIN" ? [...studentNav, ...adminNav] : studentNav;

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen border-r border-primary/20 bg-[#050001] sticky top-0 z-30",
        "transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.6)]",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      {/* Brand Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 h-16 border-b border-primary/20 bg-black/40",
          collapsed && "justify-center px-2"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shadow-[0_0_14px_#f00010] shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="font-heading font-bold text-lg tracking-wider uppercase text-white group-hover:text-rose-100 transition-colors">
              Campus<span className="text-primary group-hover:drop-shadow-[0_0_8px_#f00010]">Connect</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {!collapsed && (
          <p className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/70">
            // MAIN GRID
          </p>
        )}

        {navItems.map((item, index) => {
          const Icon = iconMap[item.icon] || Home;
          const active = isActive(item.href);

          // Add separator before admin section
          if (role === "SUPER_ADMIN" && index === studentNav.length) {
            return (
              <div key="separator" className="pt-2">
                <Separator className="my-3 mx-1 bg-primary/20" />
                <p
                  className={cn(
                    "text-[10px] font-mono text-primary font-bold uppercase tracking-widest mb-2",
                    collapsed ? "text-center text-[9px]" : "px-3"
                  )}
                >
                  {collapsed ? "•••" : "// ADMIN SYSTEM"}
                </p>
                <NavLink
                  item={item}
                  Icon={Icon}
                  active={active}
                  collapsed={collapsed}
                />
              </div>
            );
          }

          return (
            <NavLink
              key={item.href}
              item={item}
              Icon={Icon}
              active={active}
              collapsed={collapsed}
            />
          );
        })}
      </nav>

      {/* Tactical Status & Collapse toggle */}
      <div className="border-t border-primary/20 p-2 space-y-2 bg-black/30">
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-md border border-primary/20 bg-primary/5 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="pulse-dot" />
              <span>RADAR ONLINE</span>
            </div>
            <span className="text-primary font-semibold">V2.4</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-center h-9 text-muted-foreground hover:text-white hover:bg-primary/10 hover:border hover:border-primary/30 cursor-pointer transition-all",
            !collapsed && "justify-start font-mono text-xs uppercase tracking-wider"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-primary" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2 text-primary" />
              <span>Minimize Panel</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

function NavLink({
  item,
  Icon,
  active,
  collapsed,
}: {
  item: NavItem;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
}) {
  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group/link",
        active
          ? "bg-primary/20 text-white font-semibold border-l-2 border-primary shadow-[0_0_18px_rgba(240,0,16,0.3)]"
          : "text-foreground/75 hover:bg-primary/10 hover:text-white hover:translate-x-0.5",
        collapsed && "justify-center px-2 hover:translate-x-0"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-transform group-hover/link:scale-110",
          active ? "text-primary drop-shadow-[0_0_8px_#f00010]" : "text-muted-foreground group-hover/link:text-primary"
        )}
      />
      {!collapsed && (
        <span className={cn("tracking-wide font-sans", active && "font-semibold")}>
          {item.label}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={linkContent} />
        <TooltipContent side="right" className="font-mono text-xs uppercase tracking-wider bg-black border-primary text-white">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
