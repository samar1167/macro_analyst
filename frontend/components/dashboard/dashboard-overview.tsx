"use client";

import { useMemo } from "react";
import { AlertTriangle, LineChart, Radar, Scale } from "lucide-react";

import { MacroIndicatorsPanel } from "@/components/dashboard/macro-indicators-panel";
import { OpportunityTable } from "@/components/opportunities/opportunity-table";
import { DivergenceFeed } from "@/components/divergence/divergence-feed";
import { DriverBarChart } from "@/components/dashboard/driver-bar-chart";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditRuns, useDivergenceEvents, useDrivers, useIndicators, useOpportunities, useRegimes } from "@/hooks/use-platform-data";

export function DashboardOverview() {
  const indicatorsQuery = useIndicators();
  const driversQuery = useDrivers();
  const opportunitiesQuery = useOpportunities();
  const divergencesQuery = useDivergenceEvents();
  const regimesQuery = useRegimes();
  const auditsQuery = useAuditRuns();

  const activeRegime = regimesQuery.data?.results[0];
  const latestAudit = auditsQuery.data?.results[0];

  const headlineMetrics = useMemo(
    () => [
      {
        title: "Tracked Indicators",
        value: `${indicatorsQuery.data?.count ?? 0}`,
        subtitle: "Core inflation, growth, rates, FX, and credit set.",
        delta: 0.12,
      },
      {
        title: "Active Drivers",
        value: `${driversQuery.data?.count ?? 0}`,
        subtitle: "Weighted derived states used in causal propagation.",
        delta: 0.08,
      },
      {
        title: "Ranked Opportunities",
        value: `${opportunitiesQuery.data?.count ?? 0}`,
        subtitle: "Current actionable macro expressions.",
        delta: -0.05,
      },
      {
        title: "Divergence Events",
        value: `${divergencesQuery.data?.count ?? 0}`,
        subtitle: "Expected versus observed breaks in macro behavior.",
        delta: 0.2,
      },
    ],
    [divergencesQuery.data?.count, driversQuery.data?.count, indicatorsQuery.data?.count, opportunitiesQuery.data?.count]
  );

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Dashboard"
        title="Institutional macro decision cockpit"
        description="Scan the current state of the macro engine, then drill into drivers, opportunities, divergences, and reasoning traces without losing the causal context."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {headlineMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Current Macro State</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                The latest regime, audit posture, and scenario-sensitive highlights for quick orientation.
              </p>
            </div>
            <Badge variant="accent">{activeRegime?.name ?? "Awaiting regime"}</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <StateCallout icon={Scale} label="Active Regime" value={activeRegime?.name ?? "--"} detail={activeRegime?.description ?? "No regime classification available yet."} />
            <StateCallout icon={Radar} label="Latest Run" value={latestAudit?.status ?? "--"} detail={latestAudit?.notes ?? "Run the engine to generate an audit trail."} />
            <StateCallout icon={AlertTriangle} label="Top Divergence" value={divergencesQuery.data?.results[0]?.primary_pattern_code ?? "--"} detail={divergencesQuery.data?.results[0]?.summary ?? "No divergence events registered."} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Derived Driver Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverBarChart drivers={driversQuery.data?.results ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <MacroIndicatorsPanel indicators={indicatorsQuery.data?.results ?? []} />
        <DivergenceFeed events={divergencesQuery.data?.results ?? []} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <OpportunityTable opportunities={opportunitiesQuery.data?.results ?? []} />
        <Card>
          <CardHeader>
            <CardTitle>Reasoning Focus</CardTitle>
            <p className="text-sm text-muted-foreground">Use the audit view for a full step-by-step trace. This panel keeps the latest reasoning summary visible.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {(latestAudit?.payload?.applied_rules ?? []).slice(0, 5).map((rule: any) => (
              <div key={rule.rule_code} className="rounded-xl border border-border/60 bg-panel/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{rule.rule_code}</div>
                  <div className="text-xs text-primary">{rule.driver_code}</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Contribution {rule.contribution} from {rule.lead_indicator_code}
                </div>
              </div>
            ))}
            {!(latestAudit?.payload?.applied_rules ?? []).length ? (
              <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                Run a simulation to populate the reasoning stack here.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Workflow</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <WorkflowStep icon={LineChart} label="Observe" description="Track the raw indicator layer and identify changes in inflation, labor, growth, credit, and FX." />
          <WorkflowStep icon={Radar} label="Infer" description="Transform indicator moves into derived macro drivers and weighted rule propagation." />
          <WorkflowStep icon={Scale} label="Classify" description="Compare the driver stack to regime profiles and highlight active pathways." />
          <WorkflowStep icon={AlertTriangle} label="Challenge" description="Test scenario inputs and investigate divergences when outcomes break expected paths." />
        </CardContent>
      </Card>
    </div>
  );
}

function StateCallout({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-panel/60 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      </div>
      <div className="mt-4 text-lg font-semibold">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">{detail}</div>
    </div>
  );
}

function WorkflowStep({
  icon: Icon,
  label,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-panel/60 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-4 text-sm font-semibold uppercase tracking-[0.18em]">{label}</div>
      <div className="mt-2 text-sm text-muted-foreground">{description}</div>
    </div>
  );
}

