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
import { eventScenarioPresets, scenarioPresets, useScenarioStore } from "@/store/scenario-store";

const INDIA_CHANNEL_LABELS: Record<string, string> = {
  USD_DIRECTION: "U.S. dollar",
  OIL_PRESSURE: "Oil prices",
  GLOBAL_GROWTH: "Global growth",
  CREDIT_STRESS: "Credit conditions",
  RISK_APPETITE: "Investor risk appetite",
  US_YIELDS: "U.S. bond yields",
};

function describeIndiaChannel(code: string, score: number) {
  if (code === "USD_DIRECTION") {
    return score >= 0 ? "The U.S. dollar is getting stronger." : "The U.S. dollar is easing.";
  }
  if (code === "OIL_PRESSURE") {
    return score >= 0 ? "Oil prices are moving higher." : "Oil prices are cooling.";
  }
  if (code === "GLOBAL_GROWTH") {
    return score >= 0 ? "Global growth is improving." : "Global growth is slowing.";
  }
  if (code === "CREDIT_STRESS") {
    return score >= 0 ? "Credit conditions are getting tighter." : "Credit conditions are easing.";
  }
  if (code === "RISK_APPETITE") {
    return score >= 0 ? "Investor appetite for risk is improving." : "Investor appetite for risk is weakening.";
  }
  if (code === "US_YIELDS") {
    return score >= 0 ? "U.S. bond yields are moving higher." : "U.S. bond yields are easing.";
  }
  return `${INDIA_CHANNEL_LABELS[code] ?? code} is shifting.`;
}

export function ScenarioWorkbench() {
  const { label, notes, persistOpportunities, indicatorValues, resetScenario, setIndicatorValue, setScenarioMeta } = useScenarioStore();
  const mutation = useEngineExecution();
  const [selectedPresetKey, setSelectedPresetKey] = useState(scenarioPresets[0]?.key ?? "");
  const [selectedShockKey, setSelectedShockKey] = useState("none");
  const [shockSeverity, setShockSeverity] = useState<"mild" | "base" | "severe">("base");
  const [shockHorizon, setShockHorizon] = useState<"immediate" | "3m" | "12m">("3m");
  const [shockConfidence, setShockConfidence] = useState(0.8);

  const entries = useMemo(() => Object.entries(indicatorValues), [indicatorValues]);
  const simulationStory = mutation.data?.payload?.simulation_story as
    | {
        shock_scenario?: {
          label?: string;
          severity?: string;
          horizon?: string;
          channels?: string[];
          applied_impacts?: {
            indicator_code: string;
            signal_delta: number;
            value_delta: number;
          }[];
        };
        country_fallout?: {
          country_label?: string;
          outlook?: string;
          global_channels?: {
            channel_code: string;
            score: number;
          }[];
          macro_impacts?: {
            impact_code: string;
            impact_label: string;
            score: number;
            reasons?: string[];
          }[];
          sector_effects?: {
            beneficiaries?: string[];
            headwinds?: string[];
          };
          interpretation_reasons?: string[];
          opportunities?: string[];
        };
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
  const selectedRegimeCode = (mutation.data?.payload?.regime_results as any)?.selected_regime?.regime_code as string | undefined;
  const positiveRegimes = new Set(["REG_GOLDILOCKS", "REG_REFLATION"]);
  const negativeRegimes = new Set(["REG_HARD_LANDING", "REG_STAGFLATION", "REG_DISINFLATION_SLOWDOWN"]);
  const regimeCardClass = positiveRegimes.has(selectedRegimeCode ?? "")
    ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4"
    : negativeRegimes.has(selectedRegimeCode ?? "")
      ? "rounded-xl border border-rose-200 bg-rose-50 p-4"
      : "rounded-xl border border-border/70 bg-panel/70 p-4";
  const regimeTitleClass = positiveRegimes.has(selectedRegimeCode ?? "")
    ? "mt-2 text-lg font-semibold text-emerald-950"
    : negativeRegimes.has(selectedRegimeCode ?? "")
      ? "mt-2 text-lg font-semibold text-rose-950"
      : "mt-2 text-lg font-semibold";
  const regimeBodyClass = positiveRegimes.has(selectedRegimeCode ?? "")
    ? "mt-2 text-sm text-emerald-900"
    : negativeRegimes.has(selectedRegimeCode ?? "")
      ? "mt-2 text-sm text-rose-900"
      : "mt-2 text-sm text-muted-foreground";
  const shockIsPositive = new Set(["ceasefire-energy-relief", "productivity-boom", "policy-easing-tailwind"]).has(selectedShockKey);
  const shockIsNegative = new Set(["new-war", "tariff-escalation", "banking-stress"]).has(selectedShockKey);
  const shockCardClass = shockIsPositive
    ? "rounded-xl border border-emerald-200 bg-emerald-50 p-4"
    : shockIsNegative
      ? "rounded-xl border border-rose-200 bg-rose-50 p-4"
      : "rounded-xl border border-border/70 bg-panel/70 p-4";

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
            <div className="rounded-2xl border border-border/70 bg-panel/50 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shock / Situation Layer</div>
              <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Event</label>
                  <select
                    className="h-10 w-full rounded-xl border border-border bg-panel px-3 text-sm"
                    value={selectedShockKey}
                    onChange={(event) => setSelectedShockKey(event.target.value)}
                  >
                    {eventScenarioPresets.map((preset) => (
                      <option key={preset.key} value={preset.key}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Severity</label>
                  <select
                    className="h-10 w-full rounded-xl border border-border bg-panel px-3 text-sm"
                    value={shockSeverity}
                    onChange={(event) => setShockSeverity(event.target.value as "mild" | "base" | "severe")}
                  >
                    <option value="mild">Mild</option>
                    <option value="base">Base</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Horizon</label>
                  <select
                    className="h-10 w-full rounded-xl border border-border bg-panel px-3 text-sm"
                    value={shockHorizon}
                    onChange={(event) => setShockHorizon(event.target.value as "immediate" | "3m" | "12m")}
                  >
                    <option value="immediate">Immediate</option>
                    <option value="3m">3 Months</option>
                    <option value="12m">12 Months</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Confidence</label>
                  <Input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={shockConfidence}
                    onChange={(event) => setShockConfidence(Number(event.target.value))}
                  />
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {eventScenarioPresets.find((preset) => preset.key === selectedShockKey)?.description}
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
                    simulation_label: label,
                    notes,
                    persist_opportunities: persistOpportunities,
                    event_scenario: selectedShockKey === "none" ? undefined : {
                      scenario_key: selectedShockKey,
                      severity: shockSeverity,
                      horizon: shockHorizon,
                      confidence: shockConfidence,
                    },
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
                  <div className={regimeCardClass}>
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Selected Regime</div>
                    <div className={regimeTitleClass}>
                      {simulationStory?.regime_detected?.regime_name ?? (mutation.data.payload?.regime_results as any)?.selected_regime?.regime_name ?? "Unavailable"}
                    </div>
                    <div className={regimeBodyClass}>{simulationStory?.regime_detected?.summary ?? "No regime summary available yet."}</div>
                  </div>
                  {simulationStory?.shock_scenario?.label ? (
                    <div className={shockCardClass}>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shock Layer Applied</div>
                      <div className={shockIsPositive ? "mt-2 text-lg font-semibold text-emerald-950" : shockIsNegative ? "mt-2 text-lg font-semibold text-rose-950" : "mt-2 text-lg font-semibold"}>
                        {simulationStory.shock_scenario.label}
                      </div>
                      <div className={shockIsPositive ? "mt-2 text-sm text-emerald-900" : shockIsNegative ? "mt-2 text-sm text-rose-900" : "mt-2 text-sm text-muted-foreground"}>
                        {simulationStory.shock_scenario.severity} severity over a {simulationStory.shock_scenario.horizon} horizon
                      </div>
                    </div>
                  ) : null}
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
            <CardTitle>Shock to Indicator Map</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4 pr-4">
                <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Shock Scenario</div>
                  <div className="mt-2 text-lg font-semibold">{simulationStory?.shock_scenario?.label ?? "No shock overlay"}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {(simulationStory?.shock_scenario?.channels ?? []).join(", ") || "Use an event shock to see transmission channels here."}
                  </div>
                </div>
                {(simulationStory?.shock_scenario?.applied_impacts ?? []).map((impact) => (
                  <div
                    key={impact.indicator_code}
                    className={
                      impact.signal_delta >= 0
                        ? "rounded-xl border border-rose-200 bg-rose-50 p-3"
                        : "rounded-xl border border-emerald-200 bg-emerald-50 p-3"
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className={impact.signal_delta >= 0 ? "font-medium text-rose-950" : "font-medium text-emerald-950"}>
                        {impact.indicator_code}
                      </div>
                      <div className={impact.signal_delta >= 0 ? "text-xs text-rose-700" : "text-xs text-emerald-700"}>
                        signal {impact.signal_delta >= 0 ? "+" : ""}{impact.signal_delta.toFixed(2)}
                      </div>
                    </div>
                    <div className={impact.signal_delta >= 0 ? "mt-1 text-sm text-rose-800" : "mt-1 text-sm text-emerald-800"}>
                      Value shift {impact.value_delta >= 0 ? "+" : ""}{impact.value_delta.toFixed(2)}
                    </div>
                  </div>
                ))}
                {!(simulationStory?.shock_scenario?.applied_impacts ?? []).length ? (
                  <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                    Applied shock impacts will appear here once you run a simulation with an event overlay.
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

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
                      <div className={driver.contribution >= 0 ? "mt-1 text-sm text-emerald-700" : "mt-1 text-sm text-rose-700"}>
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
                  tone="positive"
                />
                <ListBlock
                  title="Likely Underperformers"
                  items={simulationStory?.industry_effects_mapped?.underperformers ?? []}
                  emptyMessage="No industry underperformers mapped yet."
                  tone="negative"
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
                          <span key={industry} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-900">
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>India Fallout Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Country Overlay</div>
                  <div className="mt-2 text-lg font-semibold">
                    {simulationStory?.country_fallout?.country_label ?? "India"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Outlook: {simulationStory?.country_fallout?.outlook ?? "Run a simulation"}
                  </div>
                </div>
                <ListBlock
                  title="Why This Fallout Is Happening"
                  items={simulationStory?.country_fallout?.interpretation_reasons ?? []}
                  emptyMessage="Interpretation reasons will appear here after a simulation."
                />
                <ListBlock
                  title="Likely Beneficiaries"
                  items={simulationStory?.country_fallout?.sector_effects?.beneficiaries ?? []}
                  emptyMessage="India beneficiary sectors will appear here after a simulation."
                  tone="positive"
                />
                <ListBlock
                  title="Likely Headwinds"
                  items={simulationStory?.country_fallout?.sector_effects?.headwinds ?? []}
                  emptyMessage="India sector headwinds will appear here after a simulation."
                  tone="negative"
                />
                <ListBlock
                  title="India Opportunity Ideas"
                  items={simulationStory?.country_fallout?.opportunities ?? []}
                  emptyMessage="India opportunity ideas will appear here after a simulation."
                />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>US Regime to India Transmission</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                <div className="rounded-xl border border-border/70 bg-panel/70 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Global Channels</div>
                  <div className="mt-3 space-y-2">
                    {(simulationStory?.country_fallout?.global_channels ?? []).length ? (
                      simulationStory?.country_fallout?.global_channels?.map((channel) => (
                        <div
                          key={channel.channel_code}
                          className={
                            channel.score >= 0
                              ? "rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
                              : "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                          }
                        >
                          <div className={channel.score >= 0 ? "font-medium text-rose-950" : "font-medium text-emerald-950"}>
                            {INDIA_CHANNEL_LABELS[channel.channel_code] ?? channel.channel_code}
                          </div>
                          <div className="mt-1">{describeIndiaChannel(channel.channel_code, channel.score)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">Global transmission channels will appear here after a simulation.</div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {(simulationStory?.country_fallout?.macro_impacts ?? []).map((impact) => (
                    <div
                      key={impact.impact_code}
                      className={
                        impact.score >= 0
                          ? "rounded-xl border border-rose-200 bg-rose-50 p-3"
                          : "rounded-xl border border-emerald-200 bg-emerald-50 p-3"
                      }
                    >
                      <div className={impact.score >= 0 ? "font-medium text-rose-950" : "font-medium text-emerald-950"}>
                        {impact.impact_label}
                      </div>
                      {(impact.reasons ?? []).length ? (
                        <div className="mt-2 space-y-1">
                          {impact.reasons?.map((reason) => (
                            <div
                              key={reason}
                              className={impact.score >= 0 ? "text-sm text-rose-900" : "text-sm text-emerald-900"}
                            >
                              {reason}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {!(simulationStory?.country_fallout?.macro_impacts ?? []).length ? (
                    <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                      India macro impact explanations will appear here after a simulation.
                    </div>
                  ) : null}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ListBlock({
  title,
  items,
  emptyMessage,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  emptyMessage: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const chipClassName =
    tone === "positive"
      ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-900"
      : tone === "negative"
        ? "rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm text-rose-900"
        : "rounded-full border border-border/60 bg-panel/70 px-3 py-1 text-sm";

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span key={item} className={chipClassName}>
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
