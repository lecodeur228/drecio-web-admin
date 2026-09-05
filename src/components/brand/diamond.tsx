import { cn } from "@/lib/utils";

export function DiamondLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn("diamond-loader", className)}
      role="status"
      aria-label="Génération en cours"
    />
  );
}
