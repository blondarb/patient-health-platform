"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
}

interface SparklineChartProps {
  data: DataPoint[];
  unit: string;
  refLow?: number;
  refHigh?: number;
  label: string;
  className?: string;
}

export function SparklineChart({
  data,
  unit,
  refLow,
  refHigh,
  label,
  className,
}: SparklineChartProps) {
  if (data.length < 2) return null;

  const chartData = data.map((d) => ({
    ...d,
    dateLabel: format(parseISO(d.date), "MMM yy"),
  }));

  const values = data.map((d) => d.value);
  const allValues = [...values];
  if (refLow !== undefined) allValues.push(refLow);
  if (refHigh !== undefined) allValues.push(refHigh);
  const min = Math.min(...allValues) * 0.9;
  const max = Math.max(...allValues) * 1.1;

  const latestValue = values[values.length - 1];
  const isAbnormal =
    (refLow !== undefined && latestValue < refLow) ||
    (refHigh !== undefined && latestValue > refHigh);

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={`Trend chart for ${label}: ${data
        .map((d) => `${d.value} ${unit} on ${format(parseISO(d.date), "MMM d, yyyy")}`)
        .join(", ")}`}
    >
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <XAxis dataKey="dateLabel" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis domain={[min, max]} hide />
          {refLow !== undefined && (
            <ReferenceLine y={refLow} stroke="#DEE2E6" strokeDasharray="3 3" />
          )}
          {refHigh !== undefined && (
            <ReferenceLine y={refHigh} stroke="#DEE2E6" strokeDasharray="3 3" />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <div className="bg-white border border-surface-border rounded-md px-2 py-1 text-xs shadow-sm">
                  <p className="font-medium">
                    {p.value} {unit}
                  </p>
                  <p className="text-text-muted">{p.dateLabel}</p>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={isAbnormal ? "#F39C12" : "#0A7E8C"}
            strokeWidth={2}
            dot={{ r: 3, fill: isAbnormal ? "#F39C12" : "#0A7E8C" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
