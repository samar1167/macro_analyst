"use client";

import { useEffect, useMemo, useState } from "react";

import { ReasoningPanel } from "@/components/shared/reasoning-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuditRuns, useDivergenceAnalysis, useDivergenceEvents } from "@/hooks/use-platform-data";

export function DivergenceMonitor() {
  const auditsQuery = useAuditRuns();
  const eventsQuery = useDivergenceEvents();
  const analysisMutation = useDivergenceAnalysis();
  const [auditId, setAuditId] = useState("1");
  const [notes, setNotes] = useState("Observed market pricing deteriorated faster than expected.");

  useEffect(() => {
    if (!auditsQuery.data?.results?.length) return;
    if (auditId.trim()) return;
    setAuditId(String(auditsQuery.data.results[0].id));
  }, [auditsQuery.data?.results, auditId]);

  const parsedAuditId = useMemo(() => {
    const trimmed = auditId.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed <= 0) return null;
    return parsed;
  }, [auditId]);

  const canAnalyze = !!parsedAuditId;

  const latestAuditId = auditsQuery.data?.results?.[0]?.id;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Divergence Monitor"
        title="Expected versus observed outcome analysis"
        description="Compare engine expectations to realized market outcomes, detect deviations, and rank likely explanations from the seeded divergence knowledge base."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Run Divergence Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Engine Run Audit ID</label>
              <Input type="number" min="1" value={auditId} onChange={(event) => setAuditId(event.target.value)} />
              <div className="text-xs text-muted-foreground">
                {latestAuditId
                  ? `Latest available audit run: ${latestAuditId}`
                  : "No audit runs found yet. Run a simulation first in Scenario Simulator."}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Notes</label>
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>
            <Button
              disabled={!canAnalyze}
              onClick={() =>
                parsedAuditId &&
                analysisMutation.mutate({
                  engine_run_audit_id: parsedAuditId,
                  persist: true,
                  notes,
                  observed_outcomes: {
                    observed_regime: { code: "REG_HARD_LANDING", score: 0.82 },
                    observed_driver_scores: {
                      CREDIT_STRESS: { signal: 0.81 },
                      GROWTH_MOMENTUM: { signal: -0.68 },
                    },
                    observed_opportunity_outcomes: {
                      REG_STAGFLATION_CREDIT_STRESS_DIV_12: { signal: 0.35 },
                    },
                    observed_indicator_values: {
                      HY_OAS: { signal: 0.92, value: 468 },
                      DXY: { signal: 0.44, value: 106.3 },
                      CORE_PCE_YOY: { signal: 0.48, value: 3.1 },
                    },
                  },
                })
              }
            >
              Analyze Divergence
            </Button>
            {!canAnalyze ? (
              <div className="text-xs text-negative">
                Enter a valid numeric engine run audit ID before running divergence analysis.
              </div>
            ) : null}
            {analysisMutation.error ? (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-negative">
                {(analysisMutation.error as Error).message}
              </div>
            ) : null}
            <div className="rounded-xl border border-border/60 bg-panel/60 p-4 text-sm text-muted-foreground">
              Latest stored events: {eventsQuery.data?.count ?? 0}. Latest engine runs: {auditsQuery.data?.count ?? 0}.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranked Candidate Explanations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {((analysisMutation.data?.analysis as any)?.candidate_explanations ?? eventsQuery.data?.results[0]?.matched_explanations ?? []).map((item: any) => (
              <div key={item.pattern_code ?? item.id} className="rounded-2xl border border-border/60 bg-panel/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{item.pattern_name ?? item.pattern_code}</div>
                  <div className="text-xs text-primary">Rank {item.rank ?? "--"}</div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{item.explanation}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <ReasoningPanel
        title="Divergence Reasoning Trace"
        items={
          ((analysisMutation.data?.analysis as any)?.deviation_results?.deviations ?? []).map((item: any) => ({
            stage: item.type,
            message: item.message,
          })) || [{ stage: "analysis", message: "Run a divergence analysis to populate this panel." }]
        }
      />
    </div>
  );
}
