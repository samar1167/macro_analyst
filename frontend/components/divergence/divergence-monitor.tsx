"use client";

import { useEffect, useMemo, useState } from "react";

import { ReasoningPanel } from "@/components/shared/reasoning-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useAuditRuns, useDivergenceAnalysis, useRegimes } from "@/hooks/use-platform-data";

const OBSERVED_INDICATORS = [
  {
    code: "CORE_PCE_YOY",
    label: "Core inflation",
    hint: "Enter the latest core inflation reading and whether it feels hotter or cooler than your prior scenario.",
  },
  {
    code: "UNEMP_RATE",
    label: "Unemployment",
    hint: "Use the latest unemployment reading and your sense of whether labor conditions are getting better or worse.",
  },
  {
    code: "ISM_MFG_PMI",
    label: "Manufacturing momentum",
    hint: "Use the PMI reading and whether growth feels stronger or weaker than expected.",
  },
  {
    code: "HY_OAS",
    label: "Credit stress",
    hint: "Higher spreads usually mean more stress. Enter the latest spread and whether stress looks higher or lower now.",
  },
  {
    code: "DXY",
    label: "U.S. dollar",
    hint: "Use the latest dollar index reading and whether financial conditions feel tighter or easier.",
  },
] as const;

const SIGNAL_OPTIONS = [
  { value: "0.85", label: "Much worse than expected" },
  { value: "0.45", label: "Slightly worse than expected" },
  { value: "0", label: "About as expected" },
  { value: "-0.45", label: "Slightly better than expected" },
  { value: "-0.85", label: "Much better than expected" },
];

function summarizeDeviation(item: any) {
  if (item.type === "regime_mismatch") {
    return "The broader macro environment looks different from what the earlier simulation expected.";
  }
  if (item.type === "driver_mismatch") {
    return "One of the model's key internal macro drivers moved more than expected.";
  }
  if (item.type === "indicator_reversal") {
    return "A major indicator has shifted enough to challenge the original scenario.";
  }
  if (item.type === "opportunity_underperformance") {
    return "The market expression tied to the original thesis is not behaving as expected.";
  }
  return item.message;
}

function buildAdjustmentIdeas(deviations: any[]) {
  const ideas: string[] = [];
  const types = new Set(deviations.map((item) => item.type));
  const messages = deviations.map((item) => item.message || "");

  if (types.has("regime_mismatch")) {
    ideas.push("Rerun the scenario with today's conditions before acting, because the market may have shifted into a different macro path.");
  }
  if (messages.some((message) => message.includes("HY_OAS"))) {
    ideas.push("Credit conditions look different from your prior view, so lean more defensive and review exposure to highly cyclical industries.");
  }
  if (messages.some((message) => message.includes("DXY"))) {
    ideas.push("Dollar conditions have changed, so re-check assumptions around liquidity, imported inflation, and exporter behavior.");
  }
  if (messages.some((message) => message.includes("CORE_PCE_YOY"))) {
    ideas.push("Inflation is not tracking the original path, so revisit rate-sensitive positions and any thesis that depends on easier policy.");
  }
  if (messages.some((message) => message.includes("UNEMP_RATE") || message.includes("ISM_MFG_PMI"))) {
    ideas.push("Growth and labor are evolving differently, so review domestic cyclicals versus defensives before carrying the original view forward.");
  }
  if (types.has("opportunity_underperformance")) {
    ideas.push("The macro thesis may still be usable, but the trade expression may be wrong, so consider simpler or more defensive ways to express it.");
  }

  return ideas.length
    ? ideas
    : ["If what you see now mostly matches the original simulation, the earlier regime view is still broadly intact."];
}

export function DivergenceMonitor() {
  const auditsQuery = useAuditRuns();
  const regimesQuery = useRegimes();
  const analysisMutation = useDivergenceAnalysis();

  const latestAudit = auditsQuery.data?.results?.[0];
  const latestAuditId = latestAudit?.id;
  const latestAuditPayload = latestAudit?.payload ?? {};
  const expectedRegime = latestAuditPayload?.regime_results?.selected_regime;
  const expectedIndicators = latestAuditPayload?.input_snapshot ?? {};

  const [auditId, setAuditId] = useState("");
  const [notes, setNotes] = useState("I want to compare my last scenario with what looks true in markets and macro data now.");
  const [persist, setPersist] = useState(false);
  const [observedRegimeCode, setObservedRegimeCode] = useState("");
  const [observedIndicators, setObservedIndicators] = useState<Record<string, { value: string; signal: string }>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!latestAudit || initialized) return;

    setAuditId(String(latestAudit.id));
    setObservedRegimeCode(expectedRegime?.regime_code ?? "");
    setObservedIndicators(
      OBSERVED_INDICATORS.reduce<Record<string, { value: string; signal: string }>>((accumulator, indicator) => {
        const expectedIndicator = expectedIndicators?.[indicator.code] ?? {};
        accumulator[indicator.code] = {
          value: expectedIndicator.value != null ? String(expectedIndicator.value) : "",
          signal: "0",
        };
        return accumulator;
      }, {})
    );
    setInitialized(true);
  }, [expectedIndicators, expectedRegime?.regime_code, initialized, latestAudit]);

  const parsedAuditId = useMemo(() => {
    const trimmed = auditId.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [auditId]);

  const observedOutcomes = useMemo(() => {
    const observedIndicatorValues = Object.entries(observedIndicators).reduce<Record<string, { value?: number; signal?: number }>>(
      (accumulator, [code, payload]) => {
        const next: { value?: number; signal?: number } = {};
        if (payload.value.trim() !== "") {
          next.value = Number(payload.value);
        }
        if (payload.signal.trim() !== "") {
          next.signal = Number(payload.signal);
        }
        if (Object.keys(next).length) {
          accumulator[code] = next;
        }
        return accumulator;
      },
      {}
    );

    return {
      observed_regime: observedRegimeCode ? { code: observedRegimeCode, score: 0.75 } : undefined,
      observed_indicator_values: observedIndicatorValues,
    };
  }, [observedIndicators, observedRegimeCode]);

  const analysis = (analysisMutation.data as any)?.analysis ?? analysisMutation.data ?? {};
  const deviations = analysis?.deviation_results?.deviations ?? [];
  const candidates = analysis?.candidate_explanations ?? [];
  const topSummary = deviations[0] ? summarizeDeviation(deviations[0]) : "Run the comparison to see what changed from the earlier scenario.";
  const adjustmentIdeas = useMemo(() => buildAdjustmentIdeas(deviations), [deviations]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Divergence Monitor"
        title="Compare your last scenario with what you see now"
        description="Use this page to check whether the market and macro backdrop still match your earlier simulation, then see what may have changed and how you might adjust."
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Reality Check Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[42rem]">
              <div className="space-y-4 pr-4">
                <div className="rounded-xl border border-border/60 bg-panel/60 p-4 text-sm text-muted-foreground">
                  Start from your latest simulation, then overwrite the fields below with what you actually believe is happening now.
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Scenario To Compare Against</label>
                    <Input type="number" min="1" value={auditId} onChange={(event) => setAuditId(event.target.value)} />
                    <div className="text-xs text-muted-foreground">
                      {latestAuditId
                        ? `Latest simulation run available: ${latestAuditId}`
                        : "No simulation runs found yet. Run a scenario first."}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">What Regime Feels Closest Now</label>
                    <select
                      className="h-10 w-full rounded-xl border border-border bg-panel px-3 text-sm"
                      value={observedRegimeCode}
                      onChange={(event) => setObservedRegimeCode(event.target.value)}
                    >
                      <option value="">Leave unset</option>
                      {(regimesQuery.data?.results ?? []).map((regime) => (
                        <option key={regime.code} value={regime.code}>
                          {regime.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {OBSERVED_INDICATORS.map((indicator) => (
                    <div key={indicator.code} className="rounded-2xl border border-border/70 bg-panel/60 p-4">
                      <div className="font-medium">{indicator.label}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{indicator.hint}</div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={observedIndicators[indicator.code]?.value ?? ""}
                          onChange={(event) =>
                            setObservedIndicators((current) => ({
                              ...current,
                              [indicator.code]: {
                                ...(current[indicator.code] ?? { value: "", signal: "0" }),
                                value: event.target.value,
                              },
                            }))
                          }
                          placeholder="Latest value"
                        />
                        <select
                          className="h-10 w-full rounded-xl border border-border bg-panel px-3 text-sm"
                          value={observedIndicators[indicator.code]?.signal ?? "0"}
                          onChange={(event) =>
                            setObservedIndicators((current) => ({
                              ...current,
                              [indicator.code]: {
                                ...(current[indicator.code] ?? { value: "", signal: "0" }),
                                signal: event.target.value,
                              },
                            }))
                          }
                        >
                          {SIGNAL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Save This As A Historical Event</label>
                    <select
                      className="h-10 w-full rounded-xl border border-border bg-panel px-3 text-sm"
                      value={persist ? "yes" : "no"}
                      onChange={(event) => setPersist(event.target.value === "yes")}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Notes</label>
                    <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
                  </div>
                </div>

                <Button
                  disabled={!parsedAuditId}
                  onClick={() =>
                    parsedAuditId &&
                    analysisMutation.mutate({
                      engine_run_audit_id: parsedAuditId,
                      persist,
                      notes,
                      observed_outcomes: observedOutcomes,
                    })
                  }
                >
                  Compare With Reality
                </Button>

                {!parsedAuditId ? (
                  <div className="text-xs text-negative">Run a scenario first, then choose a simulation ID to compare against.</div>
                ) : null}
                {analysisMutation.error ? (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-negative">
                    {(analysisMutation.error as Error).message}
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plain-English Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3 pr-4">
                  <div className="rounded-xl border border-border/60 bg-panel/60 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">What Changed Most</div>
                    <div className="mt-2 font-medium">{topSummary}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{deviations[0]?.message ?? "No comparison has been run yet."}</div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-panel/60 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">What The Model Thinks Is Happening</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {candidates[0]?.explanation ?? "Once you run the comparison, the model will suggest the most likely explanation for the mismatch."}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-panel/60 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">How You Might Adjust</div>
                    <div className="mt-2 space-y-2">
                      {adjustmentIdeas.map((idea) => (
                        <div key={idea} className="text-sm text-muted-foreground">
                          {idea}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Explanations</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3 pr-4">
                  {candidates.length ? (
                    candidates.slice(0, 5).map((item: any) => (
                      <div key={item.pattern_code ?? item.id} className="rounded-2xl border border-border/60 bg-panel/60 p-4">
                        <div className="font-medium">{item.pattern_name ?? item.pattern_code}</div>
                        <div className="mt-2 text-sm text-muted-foreground">{item.explanation}</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                      Run a comparison to see the most likely explanations.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <ReasoningPanel
        title="Detailed Difference Trace"
        heightClass="h-80"
        items={
          deviations.length
            ? deviations.map((item: any) => ({
                stage: item.type,
                message: item.message,
              }))
            : [{ stage: "analysis", message: "Run the comparison to see the detailed difference trace." }]
        }
      />
    </div>
  );
}
