import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function KpiCard({
  title,
  value,
  sub,
  icon: Icon
}: {
  title: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{title}</p>
          <div className="mt-2 text-3xl font-black tracking-tight text-zinc-950">{value}</div>
          {sub ? <p className="mt-1 text-sm text-zinc-500">{sub}</p> : null}
        </div>
        <div className="rounded-2xl bg-zinc-950 p-3 text-white">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
