import { Logo } from "@/components/brand/logo";
import { DesignModeBanner } from "@/components/layout/design-mode-banner";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-surface px-6 py-16">
      <div className="mb-10 flex flex-col items-center gap-4">
        <Logo variant="full" href={null} className="h-32 w-auto" priority />
        <LocaleSwitcher compact={false} />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-sm ring-1 ring-border">
        <DesignModeBanner />
        {children}
      </div>
    </div>
  );
}
