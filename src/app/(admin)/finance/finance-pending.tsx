"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

const FinancePendingContext = createContext(false);

export function useFinancePending() {
  return useContext(FinancePendingContext);
}

export function FinancePendingProvider({ children }: { children: ReactNode }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <FinancePendingContext.Provider value={pending}>
      <FinanceNavigateContext.Provider
        value={(href: string) => startTransition(() => router.push(href))}
      >
        {children}
      </FinanceNavigateContext.Provider>
    </FinancePendingContext.Provider>
  );
}

const FinanceNavigateContext = createContext<(href: string) => void>(
  () => undefined,
);

export function FinanceNavLink({
  href,
  active,
  className,
  children,
}: {
  href: string;
  active?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const navigate = useContext(FinanceNavigateContext);
  const pending = useFinancePending();

  return (
    <Link
      href={href}
      onClick={(event) => {
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        navigate(href);
      }}
      aria-current={active ? "page" : undefined}
      className={cn(className, pending && active && "opacity-80")}
    >
      {children}
    </Link>
  );
}

export function FinancePendingSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const pending = useFinancePending();
  return (
    <div
      className={cn(
        "transition-opacity duration-150",
        pending && "pointer-events-none opacity-55",
        className,
      )}
      aria-busy={pending}
    >
      {children}
    </div>
  );
}
