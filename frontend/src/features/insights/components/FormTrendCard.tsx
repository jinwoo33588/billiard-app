import { useMemo } from "react";
import { Group, Text } from "@mantine/core";
import type { Game } from "../../games/types";
import InsightCardShell from "./InsightCardShell";
import { fmt1 } from "../../../shared/utils/number";
import { calcAvg } from "../../../shared/utils/gameMath";

function Sparkline({
  values,
  baseline = 50,
  width = 220,
  height = 46,
}: {
  values: number[];
  baseline?: number;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 6;
  const w = width - pad * 2;
  const h = height - pad * 2;

  const points = values.map((v, i) => {
    const x = pad + (w * i) / (values.length - 1 || 1);
    const y = pad + (h * (1 - (v - min) / range));
    return `${x},${y}`;
  });

  const lastX = pad + (w * (values.length - 1)) / (values.length - 1 || 1);
  const lastY = pad + (h * (1 - (values[values.length - 1] - min) / range));
  const rawBaseY = pad + (h * (1 - (baseline - min) / range));
  const baseY = Math.min(pad + h, Math.max(pad, rawBaseY));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <line
        x1={pad}
        x2={pad + w}
        y1={baseY}
        y2={baseY}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="rgba(72, 149, 255, 0.9)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={3.5} fill="white" stroke="rgba(72, 149, 255, 0.9)" strokeWidth={2} />
    </svg>
  );
}

export default function FormTrendCard({
  games,
  title = "폼 추세",
  limit = 20,
}: {
  games: (Game & { rating?: number; avg?: number })[];
  title?: string;
  limit?: number;
}) {
  const series = useMemo(() => {
    const sample = games.slice(0, limit).reverse();
    const values = sample
      .map((g) => {
        const rating = g.rating;
        const avg = g.avg ?? calcAvg(g.score, g.inning);
        const v = Number.isFinite(rating) ? rating : avg;
        return Number.isFinite(v) ? Number(v) : null;
      })
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    return values;
  }, [games, limit]);

  const last = series.length ? series[series.length - 1] : NaN;
  const first = series.length ? series[0] : NaN;
  const delta = Number.isFinite(last - first) ? last - first : NaN;
  const avg =
    series.length > 0 ? series.reduce((a, b) => a + b, 0) / series.length : NaN;

  return (
    <InsightCardShell>
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={950} style={{ letterSpacing: -0.3 }}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            최근 {Math.min(limit, games.length)}판
          </Text>
        </div>

        <div style={{ textAlign: "right" }}>
          <Text size="xs" c="dimmed" fw={900} style={{ lineHeight: 1 }}>
            평균
          </Text>
          <Text fw={950} style={{ fontSize: 20, fontVariantNumeric: "tabular-nums" }}>
            {fmt1(avg)}
          </Text>
          {/* {Number.isFinite(delta) ? (
            <Text size="xs" c={delta >= 0 ? "teal" : "red"} fw={900}>
              {delta >= 0 ? "+" : ""}
              {fmt1(delta)}
            </Text>
          ) : null} */}
        </div>
      </Group>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
        {series.length >= 2 ? (
          <Sparkline values={series} baseline={50} />
        ) : (
          <Text size="sm" c="dimmed">
            데이터가 부족합니다.
          </Text>
        )}
      </div>
    </InsightCardShell>
  );
}
