import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSigned, scoreTone } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  subtitle,
  delta,
  badge,
}: {
  title: string;
  value: string;
  subtitle: string;
  delta?: number;
  badge?: string;
}) {
  const Icon = delta === undefined ? Minus : delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus;

  return (
    <Card className="bg-card/70">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          {badge ? <Badge variant="accent">{badge}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div className="text-3xl font-semibold tracking-tight">{value}</div>
          {delta !== undefined ? (
            <div className={`flex items-center gap-1 text-xs font-medium ${scoreTone(delta)}`}>
              <Icon className="h-4 w-4" />
              {formatSigned(delta)}
            </div>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

