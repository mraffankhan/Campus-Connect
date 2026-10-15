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

interface TopbarProps {
  user: {
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
    <header className="sticky top-0 z-40 h-16 border-b border-border glass-strong">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left: Mobile nav + Search */}
        <div className="flex items-center gap-3">
          <MobileNav role={user.role} />
          <div className="hidden sm:flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5 text-sm text-muted-foreground w-[280px] cursor-pointer hover:bg-muted transition-colors">
            <Search className="h-4 w-4" />
            <span>Search clubs, events...</span>
            <kbd className="ml-auto text-[10px] bg-background rounded px-1.5 py-0.5 border border-border font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notifications */}
          <Link
            href="/notifications"
            id="notifications-bell"
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "h-9 w-9 rounded-full relative",
            })}
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center rounded-full"
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
                  className="h-9 gap-2 px-2 rounded-full cursor-pointer"
                  id="user-menu-trigger"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                    {user.name}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                    {user.role.replace("_", " ")}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/notifications")}
                className="cursor-pointer"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
                {notificationCount > 0 && (
                  <Badge variant="destructive" className="ml-auto text-[10px]">
                    {notificationCount}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
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
