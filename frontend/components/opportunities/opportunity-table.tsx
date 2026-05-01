import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Opportunity } from "@/types/api";

export function OpportunityTable({ opportunities }: { opportunities: Opportunity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranked Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Conviction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell>
                    <Link href={`/opportunities/${opportunity.id}`} className="font-medium hover:text-primary">
                      {opportunity.title}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">{opportunity.code}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={opportunity.direction === "defensive" ? "warning" : "accent"}>{opportunity.direction || "n/a"}</Badge>
                  </TableCell>
                  <TableCell>{opportunity.status}</TableCell>
                  <TableCell>{opportunity.conviction_score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

