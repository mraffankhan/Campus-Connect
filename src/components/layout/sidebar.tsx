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
        "hidden lg:flex flex-col h-screen border-r border-sidebar-border bg-sidebar sticky top-0",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]",
        className
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2 px-4 h-16 border-b border-sidebar-border",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-primary">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-gradient">
            CampusConnect
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item, index) => {
          const Icon = iconMap[item.icon] || Home;
          const active = isActive(item.href);

          // Add separator before admin section
          if (
            role === "SUPER_ADMIN" &&
            index === studentNav.length
          ) {
            return (
              <div key="separator">
                <Separator className="my-3 mx-1" />
                <p
                  className={cn(
                    "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
                    collapsed ? "text-center text-[10px]" : "px-3"
                  )}
                >
                  {collapsed ? "•" : "Admin"}
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

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-center h-9 text-muted-foreground hover:text-foreground",
            !collapsed && "justify-start"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Collapse</span>
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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active &&
          "bg-sidebar-accent text-sidebar-primary shadow-sm",
        !active && "text-sidebar-foreground/70",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon
        className={cn(
          "h-4.5 w-4.5 shrink-0 transition-colors",
          active && "text-sidebar-primary"
        )}
      />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={linkContent} />
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}
