import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminHeader } from "@/components/layout/admin-header";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { DashboardShellSkeleton } from "@/components/layout/dashboard-shell-skeleton";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ApiError } from "@/lib/api/errors";
import { getMe } from "@/lib/api/users";

async function AdminShell({ children }: { children: React.ReactNode }) {
  let me;
  try {
    me = await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  if (
    !me.roles.includes("admin") &&
    !me.permissions.includes("admin.access")
  ) {
    redirect(process.env.NEXT_PUBLIC_SELLER_APP_URL ?? "http://localhost:3000");
  }

  return (
    <SidebarProvider>
      <AdminSidebar email={me.email} />
      <SidebarInset className="bg-surface">
        <AdminHeader email={me.email} displayName={me.display_name} />
        <div className="w-full flex-1 px-4 py-8 md:px-6 lg:px-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense>
        <NavigationProgress />
      </Suspense>
      <Suspense fallback={<DashboardShellSkeleton />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </>
  );
}
