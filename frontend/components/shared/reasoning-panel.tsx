"use client";

import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

function toneClasses(stage?: string) {
  const normalized = stage?.toLowerCase() ?? "";

  if (normalized.includes("shock") || normalized.includes("india_fallout")) {
    return {
      container: "rounded-xl border border-amber-200 bg-amber-50 p-3",
      label: "text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800",
      body: "mt-1 text-sm text-amber-950",
    };
  }

  if (normalized.includes("opportunities") || normalized.includes("industry_effects")) {
    return {
      container: "rounded-xl border border-emerald-200 bg-emerald-50 p-3",
      label: "text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800",
      body: "mt-1 text-sm text-emerald-950",
    };
  }

  if (normalized.includes("regime") || normalized.includes("driver")) {
    return {
      container: "rounded-xl border border-sky-200 bg-sky-50 p-3",
      label: "text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-800",
      body: "mt-1 text-sm text-sky-950",
    };
  }

  return {
    container: "rounded-xl border border-border/60 bg-panel/60 p-3",
    label: "text-[11px] font-semibold uppercase tracking-[0.16em] text-primary",
    body: "mt-1 text-sm text-muted-foreground",
  };
}

export function ReasoningPanel({
  title,
  items,
  heightClass = "max-h-64",
}: {
  title: string;
  items: { stage?: string; message: string }[];
  heightClass?: string;
}) {
  return (
    <Collapsible defaultOpen>
      <Card className="bg-card/65">
        <CardHeader className="pb-3">
          <CollapsibleTrigger className="flex w-full items-center justify-between text-left">
            <CardTitle>{title}</CardTitle>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <ScrollArea className={heightClass}>
              <div className="space-y-3 pr-4">
                {items.map((item, index) => {
                  const tones = toneClasses(item.stage);
                  return (
                    <div key={`${item.message}-${index}`} className={tones.container}>
                      <div className={tones.label}>
                        {item.stage || "trace"}
                      </div>
                      <div className={tones.body}>{item.message}</div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
