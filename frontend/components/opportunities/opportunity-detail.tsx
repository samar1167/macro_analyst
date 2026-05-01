import { ReasoningPanel } from "@/components/shared/reasoning-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Opportunity } from "@/types/api";

export function OpportunityDetail({ opportunity }: { opportunity: Opportunity }) {
  const explanation = opportunity.explanation_trace as Record<string, any>;
  const items = [
    {
      stage: "regime",
      message: `Regime: ${explanation.regime?.regime_name ?? "Unknown"} with score ${explanation.regime?.score ?? "--"}.`,
    },
    {
      stage: "driver",
      message: `Supporting driver ${explanation.driver?.driver_name ?? "--"} net score ${explanation.driver?.net_score ?? "--"}.`,
    },
    {
      stage: "divergence",
      message: explanation.divergence?.pattern_name
        ? `Divergence confirmation: ${explanation.divergence.pattern_name}.`
        : "No divergence confirmation linked.",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{opportunity.title}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{opportunity.description}</p>
          </div>
          <Badge variant={opportunity.direction === "defensive" ? "warning" : "accent"}>{opportunity.direction}</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/70 bg-panel/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Conviction</div>
            <div className="mt-2 text-3xl font-semibold">{opportunity.conviction_score}</div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-panel/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Status</div>
            <div className="mt-2 text-xl font-semibold">{opportunity.status}</div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-panel/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Detected</div>
            <div className="mt-2 text-xl font-semibold">{opportunity.detected_at ?? "--"}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(opportunity.score_components || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-xl border border-border/70 bg-panel/60 px-4 py-3">
                <span className="text-sm uppercase tracking-[0.14em] text-muted-foreground">{key.replaceAll("_", " ")}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <ReasoningPanel title="Rationale Stack" items={items} />
      </div>
    </div>
  );
}

