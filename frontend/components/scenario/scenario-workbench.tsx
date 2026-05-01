"use client";

import { useMemo, useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";

import { ReasoningPanel } from "@/components/shared/reasoning-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useEngineExecution } from "@/hooks/use-platform-data";
import { scenarioPresets, useScenarioStore } from "@/store/scenario-store";

export function ScenarioWorkbench() {
  const { label, notes, persistOpportunities, indicatorValues, resetScenario, setIndicatorValue, setScenarioMeta } = useScenarioStore();
  const mutation = useEngineExecution();
  const [selectedPresetKey, setSelectedPresetKey] = useState(scenarioPresets[0]?.key ?? "");

  const entries = useMemo(() => Object.entries(indicatorValues), [indicatorValues]);
  const simulationStory = mutation.data?.payload?.simulation_story as
    | {
        regime_detected?: {
          regime_name?: string;
          score?: number;
          summary?: string;
        };
        key_drivers_identified?: {
          driver_code: string;
          driver_name: string;
          net_score: number;
          contribution: number;
        }[];
        industry_effects_mapped?: {
          outperformers?: string[];
          underperformers?: string[];
          transmission_channels?: string[];
        };
        opportunities_generated?: {
          code: string;
          title: string;
          direction: string;
          status: string;
          conviction_score: number;
          supporting_driver: string;
          brief_explanation?: string;
          beneficiary_industries?: string[];
        }[];
        reasoning_chain?: { stage?: string; message: string }[];
      }
    | undefined;

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
                <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Quick Regime Preset</label>
                <div className="flex gap-2">
                  <select
                    className="h-10 w-full rounded-xl border border-border bg-panel px-3 text-sm"
                    value={selectedPresetKey}
                    onChange={(event) => setSelectedPresetKey(event.target.value)}
                  >
                    {scenarioPresets.map((preset) => (
                      <option key={preset.key} value={preset.key}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const preset = scenarioPresets.find((item) => item.key === selectedPresetKey);
                      if (!preset) return;
                      setScenarioMeta({
                        label: preset.label,
                        notes: preset.notes,
                      });
                      Object.entries(preset.indicatorValues).forEach(([code, payload]) => {
                        setIndicatorValue(code, payload);
                      });
                    }}
                  >
                    Apply Preset
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Scenario Label</label>
                <Input value={label} onChange={(event) => setScenarioMeta({ label: event.target.value })} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
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
              <ScrollArea className="h-56">
                {mutation.data ? (
                  <div className="space-y-3 pr-4">
                    <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Run Status</div>
                      <div className="mt-2 text-lg font-semibold">{mutation.data.status}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Selected Regime</div>
                      <div className="mt-2 text-lg font-semibold">
                        {simulationStory?.regime_detected?.regime_name ?? (mutation.data.payload?.regime_results as any)?.selected_regime?.regime_name ?? "Unavailable"}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{simulationStory?.regime_detected?.summary ?? "No regime summary available yet."}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    No simulation run yet. Edit the scenario and execute the backend engine.
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <ReasoningPanel
            title="Simulation Trace"
            heightClass="h-80"
            items={
              (simulationStory?.reasoning_chain as { stage?: string; message: string }[]) ??
              [{ stage: "simulation", message: "Engine reasoning trace will appear here after execution." }]
            }
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Regime to Driver Map</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4 pr-4">
                <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Regime Detected</div>
                  <div className="mt-2 text-lg font-semibold">{simulationStory?.regime_detected?.regime_name ?? "Run a simulation"}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Score {simulationStory?.regime_detected?.score?.toFixed(2) ?? "--"}
                  </div>
                </div>
                <div className="space-y-3">
                  {(simulationStory?.key_drivers_identified ?? []).map((driver) => (
                    <div key={driver.driver_code} className="rounded-xl border border-border/60 bg-panel/60 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{driver.driver_name}</div>
                        <div className="text-xs text-primary">{driver.driver_code}</div>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Net score {driver.net_score.toFixed(2)} | regime contribution {driver.contribution.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  {!(simulationStory?.key_drivers_identified ?? []).length ? (
                    <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                      Key drivers will appear here once the engine selects a regime.
                    </div>
                  ) : null}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Effects Mapped</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4 pr-4">
                <ListBlock
                  title="Likely Outperformers"
                  items={simulationStory?.industry_effects_mapped?.outperformers ?? []}
                  emptyMessage="No industry outperformers mapped yet."
                />
                <ListBlock
                  title="Likely Underperformers"
                  items={simulationStory?.industry_effects_mapped?.underperformers ?? []}
                  emptyMessage="No industry underperformers mapped yet."
                />
                <ListBlock
                  title="Transmission Channels"
                  items={simulationStory?.industry_effects_mapped?.transmission_channels ?? []}
                  emptyMessage="No transmission channels mapped yet."
                />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunities Generated</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="grid gap-3 pr-4 md:grid-cols-2 xl:grid-cols-3">
              {(simulationStory?.opportunities_generated ?? []).map((opportunity) => (
                <div key={opportunity.code} className="rounded-xl border border-border/60 bg-panel/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">{opportunity.title}</div>
                    <div className="text-xs text-primary">{opportunity.status}</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Direction {opportunity.direction || "n/a"} | conviction {opportunity.conviction_score.toFixed(1)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Supporting driver: {opportunity.supporting_driver}</div>
                  <div className="mt-3 text-sm text-muted-foreground">
                    {opportunity.brief_explanation ?? "This opportunity is generated from the selected regime and its strongest supporting driver."}
                  </div>
                  <div className="mt-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Industries Likely To Benefit</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(opportunity.beneficiary_industries ?? []).length ? (
                        opportunity.beneficiary_industries?.map((industry) => (
                          <span key={industry} className="rounded-full border border-border/60 bg-panel/70 px-3 py-1 text-sm">
                            {industry}
                          </span>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No specific beneficiary industries mapped yet.</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!(simulationStory?.opportunities_generated ?? []).length ? (
                <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  Opportunity ideas will appear here after a successful simulation.
                </div>
              ) : null}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function ListBlock({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: string[];
  emptyMessage: string;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span key={item} className="rounded-full border border-border/60 bg-panel/70 px-3 py-1 text-sm">
              {item}
            </span>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
