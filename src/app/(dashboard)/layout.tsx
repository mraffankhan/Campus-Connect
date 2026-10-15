import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  if (!user.department || !user.year) {
    redirect("/complete-profile");
  }

  // Fetch unread notifications count
  let unreadNotificationsCount = 0;
  try {
    unreadNotificationsCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });
  } catch {
    // If DB is offline during early phases, fail gracefully
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
          }}
          notificationCount={unreadNotificationsCount}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
