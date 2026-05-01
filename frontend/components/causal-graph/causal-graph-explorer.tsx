"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDrivers, useRules } from "@/hooks/use-platform-data";

export function CausalGraphExplorer() {
  const driversQuery = useDrivers();
  const rulesQuery = useRules();

  const { nodes, edges } = useMemo(() => {
    const driverNodes: Node[] = (driversQuery.data?.results ?? []).map((driver, index) => ({
      id: `driver-${driver.id}`,
      position: { x: 480, y: index * 110 },
      data: { label: `${driver.code}` },
      style: { background: "#112130", color: "#e2e8f0", border: "1px solid rgba(45, 212, 191, 0.35)", borderRadius: 14 },
    }));

    const ruleNodes: Node[] = (rulesQuery.data?.results ?? []).map((rule, index) => ({
      id: `rule-${rule.id}`,
      position: { x: 200, y: index * 110 },
      data: { label: rule.code },
      style: { background: "#1b1626", color: "#f8fafc", border: "1px solid rgba(245, 158, 11, 0.28)", borderRadius: 14 },
    }));

    const ruleEdges: Edge[] = (rulesQuery.data?.results ?? [])
      .filter((rule) => rule.derived_driver)
      .map((rule) => ({
        id: `edge-${rule.id}`,
        source: `rule-${rule.id}`,
        target: `driver-${rule.derived_driver}`,
        animated: true,
        label: rule.effect_expression,
        style: { stroke: "#2dd4bf", strokeWidth: 1.5 },
      }));

    return {
      nodes: [...ruleNodes, ...driverNodes],
      edges: ruleEdges,
    };
  }, [driversQuery.data?.results, rulesQuery.data?.results]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Causal Graph"
        title="Interactive propagation map"
        description="Explore how rule nodes feed weighted causal effects into derived drivers. This is designed to expand later with observed activation overlays and user-selected pathways."
      />
      <Card>
        <CardHeader>
          <CardTitle>Rules to Driver Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[720px] rounded-2xl border border-border/70 bg-panel/60">
            <ReactFlow nodes={nodes} edges={edges} fitView>
              <MiniMap />
              <Controls />
              <Background color="rgba(148,163,184,0.14)" gap={28} />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

