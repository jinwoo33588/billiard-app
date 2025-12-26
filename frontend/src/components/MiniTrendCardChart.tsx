import React, { useMemo, useState } from "react";
import { Card, Group, Text, Select } from "@mantine/core";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type Metric = "average" | "winRate";
type Range = "recent6" | "recent12" | "all";

type Row = {
  label: string;           // "2025.10"
  average: number | null;  // null 가능
  winRate: number | null;  // null 가능
};

function sliceByRange(data: Row[], range: Range) {
  if (range === "all") return data;
  const n = range === "recent6" ? 6 : 12;
  return data.slice(Math.max(0, data.length - n));
}

const metricMeta: Record<Metric, { title: string; subtitle: string; unit?: string }> = {
  average: { title: "월별 변화 추이", subtitle: "월 에버리지", unit: "" },
  winRate: { title: "월별 변화 추이", subtitle: "월 승률", unit: "%" },
};

export default function MiniTrendCardChart({
  data,
}: {
  data: Row[];
}) {
  const [range, setRange] = useState<Range>("recent6");
  const [metric, setMetric] = useState<Metric>("average");

  const viewData = useMemo(() => sliceByRange(data, range), [data, range]);
  const meta = metricMeta[metric];

  // Y축 도메인 살짝 여유
  const domain = useMemo(() => {
    const vals = viewData.map(d => d[metric]).filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return [0, 1];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.15 || (metric === "winRate" ? 5 : 0.1);
    const lo = metric === "winRate" ? Math.max(0, min - pad) : Math.max(0, min - pad);
    const hi = metric === "winRate" ? Math.min(100, max + pad) : max + pad;
    return [Number(lo.toFixed(2)), Number(hi.toFixed(2))];
  }, [viewData, metric]);

  return (
    <Card withBorder radius="md" p="sm" shadow="sm">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Text fw={800} fz="lg">{meta.title}</Text>
          <Text c="dimmed" fz="sm">{meta.subtitle}</Text>
        </div>

        <Group gap="xs" wrap="nowrap">
          <Select
            value={range}
            onChange={(v) => setRange((v as Range) || "recent6")}
            data={[
              { value: "recent6", label: "최근 6개월" },
              { value: "recent12", label: "최근 12개월" },
              { value: "all", label: "전체" },
            ]}
            w={120}
            radius="xl"
          />
          <Select
            value={metric}
            onChange={(v) => setMetric((v as Metric) || "average")}
            data={[
              { value: "average", label: "에버리지" },
              { value: "winRate", label: "승률" },
            ]}
            w={110}
            radius="xl"
          />
        </Group>
      </Group>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={viewData} margin={{ top: 16, right: 10, left: 0, bottom: 0 }}>
          {/* 세로 점선 느낌 */}
          <CartesianGrid strokeDasharray="2 6" vertical horizontal={false} />

          <XAxis
            dataKey="label"
            tickMargin={10}
            interval="preserveStartEnd"
            minTickGap={22}
          />

          {/* Y축 숫자는 숨기고(스샷 느낌), 범위만 유지 */}
          <YAxis domain={domain as any} tick={false} axisLine={false} />

          <defs>
            {/* 아래 연한 fill */}
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c7ed6" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#1c7ed6" stopOpacity={0.00} />
            </linearGradient>
          </defs>

          <Tooltip
            contentStyle={{ borderRadius: 12 }}
            formatter={(value: any) => {
              if (value === null || value === undefined) return ["-", meta.subtitle];
              return [metric === "winRate" ? `${Number(value).toFixed(1)}%` : Number(value).toFixed(3), meta.subtitle];
            }}
          />

          <Area
            dataKey={metric}
            type="monotone"
            fill="url(#trendFill)"
            stroke="none"
            connectNulls={false}
          />

          <Line
            dataKey={metric}
            type="monotone"
            stroke="#1c7ed6"
            strokeWidth={3}
            dot={{ r: 5, fill: "white", stroke: "#1c7ed6", strokeWidth: 2 }}
            activeDot={{
              r: 9,
              fill: "white",
              stroke: "#1c7ed6",
              strokeWidth: 4,
            }}
            connectNulls={false}
            label={({ x, y, value, index }) => {
              // 마지막/활성만 라벨 주고 싶으면 여기 조건 바꾸면 됨
              // 지금은 값이 있는 점만 라벨 표시(스샷처럼 숫자 위에)
              if (value === null || value === undefined) return null;
              return (
                <text x={x} y={y - 12} textAnchor="middle" fontSize={14} fontWeight={800} fill="#ff6b6b">
                  {metric === "winRate" ? `${Number(value).toFixed(1)}` : Number(value).toFixed(3)}
                </text>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}