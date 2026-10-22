"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, User, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { DemoPersonaSwitcher } from "./demo-persona-switcher";

interface TopbarProps {
  user: {
    id?: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  notificationCount?: number;
}

export function Topbar({ user, notificationCount = 0 }: TopbarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-primary/20 bg-black/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Mobile nav + Search */}
        <div className="flex items-center gap-3">
          <MobileNav role={user.role} />
          <div className="hidden sm:flex items-center gap-2 bg-[#0d0103] border border-primary/25 rounded-lg px-3 py-1.5 text-xs text-muted-foreground w-[280px] cursor-pointer hover:border-primary/50 hover:bg-[#140103] transition-all shadow-[inset_0_1px_0_rgba(240,0,16,0.15)] group">
            <Search className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-mono uppercase tracking-wider text-[11px]">Search grid...</span>
            <kbd className="ml-auto text-[10px] bg-black/60 rounded px-1.5 py-0.5 border border-primary/30 font-mono text-primary font-bold">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Demo Persona Switcher */}
          <DemoPersonaSwitcher
            currentUserId={user.id}
            currentRole={user.role}
            currentName={user.name}
          />

          <ThemeToggle />

          {/* Notifications */}
          <Link
            href="/notifications"
            id="notifications-bell"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "h-9 w-9 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/20 hover:border-primary relative text-foreground hover:text-white transition-all shadow-[inset_0_1px_0_rgba(240,0,16,0.15)]",
            })}
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] font-mono flex items-center justify-center rounded-full bg-primary text-white border border-rose-300 shadow-[0_0_10px_#f00010]"
              >
                {notificationCount > 99 ? "99+" : notificationCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Link>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className="h-9 gap-2 px-2.5 rounded-lg border border-primary/25 bg-[#0d0103] hover:bg-primary/10 hover:border-primary/50 cursor-pointer transition-all"
                  id="user-menu-trigger"
                >
                  <Avatar className="h-6 w-6 border border-primary/60 shadow-[0_0_8px_rgba(240,0,16,0.4)]">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                    <AvatarFallback className="text-[10px] font-bold bg-primary text-white">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-xs font-mono uppercase tracking-wider font-semibold max-w-[120px] truncate text-white">
                    {user.name}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56 bg-[#090102] border-primary/30 text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-heading uppercase text-sm font-bold tracking-wide text-white">{user.name}</p>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">{user.email}</p>
                  <Badge variant="outline" className="w-fit text-[9px] font-mono uppercase px-1.5 py-0 border-primary/40 bg-primary/10 text-rose-300 mt-1">
                    {user.role.replace("_", " ")}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer font-mono text-xs uppercase tracking-wider hover:bg-primary/15 hover:text-white"
              >
                <User className="mr-2 h-4 w-4 text-primary" />
                Student Pass
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/notifications")}
                className="cursor-pointer font-mono text-xs uppercase tracking-wider hover:bg-primary/15 hover:text-white"
              >
                <Bell className="mr-2 h-4 w-4 text-primary" />
                Alerts
                {notificationCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-[9px] font-mono">
                    {notificationCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-primary/20" />
              <DropdownMenuItem
                className="cursor-pointer text-rose-400 focus:text-rose-300 hover:bg-destructive/20 font-mono text-xs uppercase tracking-wider"
                onClick={async () => {
                  await logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
