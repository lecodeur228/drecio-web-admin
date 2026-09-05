"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  CoinsIcon,
  HouseIcon,
  ImagesIcon,
  PlusIcon,
  ScrollTextIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { SidebarBalance } from "@/features/overview/sidebar-balance";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  displayName,
  drecs,
}: {
  displayName: string | null;
  drecs: number;
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const nav = [
    { href: "/", label: t("overview"), icon: HouseIcon },
    { href: "/studio", label: t("studio"), icon: ImagesIcon },
    { href: "/journal", label: t("journal"), icon: ScrollTextIcon },
    { href: "/credits", label: t("credits"), icon: CoinsIcon },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Logo variant="wordmark" href="/" className="hidden h-6 sm:block" priority />
        <Logo variant="icon" href="/" className="h-7 w-7 sm:hidden" priority />
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          {displayName || t("studio")}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      className="h-10 rounded-xl data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-[var(--brand-hover)] data-active:hover:text-primary-foreground"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-3 p-4">
        <SidebarBalance initialBalance={drecs} />
        <Link
          href="/articles/new"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-xl",
          )}
        >
          <PlusIcon />
          {tCommon("newArticle")}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
