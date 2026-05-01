import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DivergenceEvent } from "@/types/api";

export function DivergenceFeed({ events }: { events: DivergenceEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Divergence Monitor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <Link key={event.id} href="/divergence" className="block rounded-2xl border border-border/60 bg-panel/60 p-4 transition hover:border-primary/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{event.summary}</div>
                <div className="mt-1 text-xs text-muted-foreground">{event.code}</div>
              </div>
              <Badge variant="warning">{event.primary_pattern_code ?? "n/a"}</Badge>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

