"use client";

import { useMemo } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";

import { ReasoningPanel } from "@/components/shared/reasoning-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEngineExecution } from "@/hooks/use-platform-data";
import { useScenarioStore } from "@/store/scenario-store";

export function ScenarioWorkbench() {
  const { label, notes, persistOpportunities, indicatorValues, resetScenario, setIndicatorValue, setScenarioMeta } = useScenarioStore();
  const mutation = useEngineExecution();

  const entries = useMemo(() => Object.entries(indicatorValues), [indicatorValues]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Scenario Simulator"
        title="Hypothetical indicator editing with direct engine recalculation"
        description="Stress-test alternate macro paths by changing indicator signals and pushing them through the backend inference engine."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Scenario Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Scenario Label</label>
                <Input value={label} onChange={(event) => setScenarioMeta({ label: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Persist Opportunities</label>
                <select
                  className="h-10 w-full rounded-xl border border-border bg-panel px-3 text-sm"
                  value={persistOpportunities ? "yes" : "no"}
                  onChange={(event) => setScenarioMeta({ persistOpportunities: event.target.value === "yes" })}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Notes</label>
              <Textarea value={notes} onChange={(event) => setScenarioMeta({ notes: event.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {entries.map(([code, payload]) => (
                <div key={code} className="rounded-2xl border border-border/70 bg-panel/60 p-4">
                  <div className="mb-3 text-sm font-semibold">{code}</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={payload.signal ?? 0}
                      onChange={(event) => setIndicatorValue(code, { ...payload, signal: Number(event.target.value) })}
                      placeholder="Signal"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={payload.value ?? 0}
                      onChange={(event) => setIndicatorValue(code, { ...payload, value: Number(event.target.value) })}
                      placeholder="Value"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  mutation.mutate({
                    run_type: "macro_inference",
                    triggered_by: label,
                    notes,
                    persist_opportunities: persistOpportunities,
                    indicator_values: indicatorValues,
                  })
                }
              >
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run Simulation
              </Button>
              <Button variant="secondary" onClick={resetScenario}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Latest Simulation Output</CardTitle>
            </CardHeader>
            <CardContent>
              {mutation.data ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Run Status</div>
                    <div className="mt-2 text-lg font-semibold">{mutation.data.status}</div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Selected Regime</div>
                    <div className="mt-2 text-lg font-semibold">
                      {(mutation.data.payload?.regime_results as any)?.selected_regime?.regime_name ?? "Unavailable"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No simulation run yet. Edit the scenario and execute the backend engine.
                </div>
              )}
            </CardContent>
          </Card>

          <ReasoningPanel
            title="Simulation Trace"
            items={
              ((mutation.data?.payload?.regime_results as any)?.selected_regime?.explanation_trace as { stage?: string; message: string }[]) ??
              [{ stage: "simulation", message: "Engine reasoning trace will appear here after execution." }]
            }
          />
        </div>
      </div>
    </div>
  );
}

