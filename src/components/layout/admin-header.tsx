"use client";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { UserNav } from "@/components/layout/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminHeader({
  email,
  displayName,
}: {
  email: string;
  displayName: string | null;
}) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-xl">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1" />
      <LocaleSwitcher />
      <UserNav email={email} displayName={displayName} />
    </header>
  );
}
