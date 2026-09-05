import { Badge } from "@/components/ui/badge";

export function DrecBadge({ balance }: { balance: number }) {
  return (
    <Badge className="h-7 gap-1.5 rounded-[0.75rem] px-2.5 font-medium">
      <span className="diamond size-2 bg-white" aria-hidden />
      {balance} Drec{balance === 1 ? "" : "s"}
    </Badge>
  );
}
