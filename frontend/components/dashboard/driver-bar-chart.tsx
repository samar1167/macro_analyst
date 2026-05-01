"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { scoreTone } from "@/lib/utils";
import type { DerivedDriver } from "@/types/api";

export function DriverBarChart({ drivers }: { drivers: DerivedDriver[] }) {
  const data = drivers.map((driver, index) => ({
    name: driver.code.replaceAll("_", " "),
    score: (Number(driver.weight) || 0) * (Number(driver.confidence_score) || 0) * (index % 2 === 0 ? 1 : -1),
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 28 }}>
          <XAxis type="number" stroke="rgba(148,163,184,0.5)" />
          <YAxis dataKey="name" type="category" stroke="rgba(148,163,184,0.5)" width={130} />
          <Tooltip
            contentStyle={{
              background: "#091018",
              border: "1px solid rgba(78, 96, 120, 0.5)",
              borderRadius: "12px",
            }}
          />
          <Bar dataKey="score" radius={[0, 10, 10, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.score >= 0 ? "#4ade80" : "#fb7185"} className={scoreTone(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

