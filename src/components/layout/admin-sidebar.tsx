"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronDownIcon,
  CpuIcon,
  FileTextIcon,
  HeartPulseIcon,
  HouseIcon,
  ImagesIcon,
  KeyRoundIcon,
  MapPinIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldIcon,
  ToggleLeftIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const SELLER_APP_URL =
  process.env.NEXT_PUBLIC_SELLER_APP_URL ?? "http://localhost:3000";

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
  const tSys = useTranslations("admin.system.nav");
  const systemOpen = pathname === "/system" || pathname.startsWith("/system/");

  const topNav = [
    { href: "/", label: t("overview"), icon: HouseIcon },
    { href: "/finance", label: t("finance"), icon: WalletIcon },
    { href: "/users", label: t("users"), icon: UsersIcon },
    { href: "/roles", label: t("roles"), icon: KeyRoundIcon },
    { href: "/generations", label: t("generations"), icon: ImagesIcon },
    { href: "/audit", label: t("audit"), icon: ScrollTextIcon },
  ];

  const systemChildren = [
    { href: "/system/status", label: tSys("status"), icon: HeartPulseIcon },
    { href: "/system/models", label: tSys("models"), icon: CpuIcon },
    { href: "/system/features", label: tSys("features"), icon: ToggleLeftIcon },
    { href: "/system/prompts", label: tSys("prompts"), icon: FileTextIcon },
    { href: "/system/placements", label: tSys("placements"), icon: MapPinIcon },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Logo variant="wordmark" href="/" className="hidden h-6 sm:block" priority />
        <Logo variant="icon" href="/" className="h-7 w-7 sm:hidden" priority />
        <p className="mt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("badge")}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {topNav.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      className="h-10 rounded-xl data-active:bg-primary data-active:text-primary-foreground"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/system/models" />}
                  isActive={systemOpen}
                  className="h-10 rounded-xl data-active:bg-primary data-active:text-primary-foreground"
                >
                  <ShieldIcon />
                  <span>{t("system")}</span>
                  <ChevronDownIcon
                    className={cn(
                      "ml-auto size-4 transition-transform",
                      systemOpen && "rotate-180",
                    )}
                  />
                </SidebarMenuButton>
                {systemOpen ? (
                  <SidebarMenuSub>
                    {systemChildren.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          render={<Link href={item.href} />}
                          isActive={pathname === item.href}
                          className="h-9 rounded-lg data-active:bg-muted data-active:text-foreground"
                        >
                          <item.icon className="size-3.5" />
                          <span>{item.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/settings" />}
                  isActive={pathname.startsWith("/settings")}
                  className="h-10 rounded-xl data-active:bg-primary data-active:text-primary-foreground"
                >
                  <SettingsIcon />
                  <span>{t("settings")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 p-4">
        <p className="truncate text-xs text-muted-foreground">{email}</p>
        <a
          href={SELLER_APP_URL}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {t("backStudio")}
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
