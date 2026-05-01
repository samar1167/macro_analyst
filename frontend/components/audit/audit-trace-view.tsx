import { ReasoningPanel } from "@/components/shared/reasoning-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EngineRunAudit } from "@/types/api";

export function AuditTraceView({ audit }: { audit: EngineRunAudit }) {
  const selectedRegime = (audit.payload?.regime_results as any)?.selected_regime;
  const driverScores = Object.values((audit.payload?.derived_driver_scores as Record<string, any>) || {});

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Audit Trace"
        title={`Engine Run #${audit.id}`}
        description="Follow the backend reasoning stack from driver computation through rule propagation, regime classification, and final opportunity construction."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Run Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-panel/70 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Status</div>
              <div className="mt-2 text-xl font-semibold">{audit.status}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-panel/70 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Selected Regime</div>
              <div className="mt-2 text-xl font-semibold">{selectedRegime?.regime_name ?? "--"}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-panel/70 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Triggered By</div>
              <div className="mt-2 text-xl font-semibold">{audit.triggered_by}</div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-panel/70 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Notes</div>
              <div className="mt-2 text-sm text-muted-foreground">{audit.notes}</div>
            </div>
          </CardContent>
        </Card>
        <ReasoningPanel
          title="Regime Trace"
          items={selectedRegime?.explanation_trace ?? [{ stage: "regime", message: "No regime trace found." }]}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {driverScores.map((driver: any) => (
          <ReasoningPanel key={driver.driver_code} title={driver.driver_name} items={driver.explanation_trace ?? []} />
        ))}
      </div>
    </div>
  );
}

