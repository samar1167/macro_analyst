import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPct } from "@/lib/utils";
import type { Indicator } from "@/types/api";

export function MacroIndicatorsPanel({ indicators }: { indicators: Indicator[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Macro Indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Lag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicators.map((indicator) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="font-mono text-xs text-primary">{indicator.code}</TableCell>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger className="text-left">{indicator.name}</TooltipTrigger>
                        <TooltipContent>{indicator.rationale || indicator.description}</TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{indicator.category}</TableCell>
                    <TableCell>{formatPct(Number(indicator.weight) * 100)}</TableCell>
                    <TableCell>{formatPct(Number(indicator.confidence_score) * 100)}</TableCell>
                    <TableCell>{indicator.lag_months ?? 0}m</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

