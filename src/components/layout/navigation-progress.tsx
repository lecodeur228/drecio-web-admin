"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const prevUrl = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const url = pathname + searchParams.toString();
    if (url !== prevUrl.current) {
      prevUrl.current = url;
      setLoading(false);
      setProgress(100);
      const t = setTimeout(() => setProgress(0), 200);
      return () => clearTimeout(t);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (anchor.getAttribute("download") != null) return;

      const current = pathname + searchParams.toString();
      if (href === current || href === pathname) return;

      setLoading(true);
      setProgress(20);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          return p + Math.random() * 12;
        });
      }, 300);
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearInterval(timerRef.current);
    };
  }, [pathname, searchParams]);

  if (progress === 0) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] h-0.5">
      <div
        className={cn(
          "h-full bg-primary transition-all",
          loading ? "duration-300 ease-out" : "duration-200 ease-in",
        )}
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
