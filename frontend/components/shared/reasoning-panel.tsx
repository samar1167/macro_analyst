"use client";

import { ChevronDown } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ReasoningPanel({
  title,
  items,
}: {
  title: string;
  items: { stage?: string; message: string }[];
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
            <ScrollArea className="max-h-64">
              <div className="space-y-3 pr-4">
                {items.map((item, index) => (
                  <div key={`${item.message}-${index}`} className="rounded-xl border border-border/60 bg-panel/60 p-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {item.stage || "trace"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.message}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

