import { Group, SegmentedControl, Text } from "@mantine/core";
import type { RankingMetric, RankingMode } from "../types";

export default function RankingControls({
  mode,
  setMode,
  metric,
  setMetric,
}: {
  mode: RankingMode;
  setMode: (v: RankingMode) => void;
  metric: RankingMetric;
  setMetric: (v: RankingMetric) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 14,
        padding: 10,
        background: "rgba(255,255,255,0.92)",
      }}
    >
      <Group justify="space-between" align="center" mb={8}>
        <Text fw={950} style={{ letterSpacing: -0.2 }}>
          필터
        </Text>
      </Group>

      <Group grow align="flex-start" wrap="nowrap">
        <div>
          <Text size="xs" c="dimmed" fw={900} mb={6}>
            기간
          </Text>
          <SegmentedControl
            fullWidth
            value={mode}
            onChange={(v) => setMode(v as RankingMode)}
            data={[
              { label: "이번달", value: "thisMonth" },
              { label: "전체", value: "all" },
            ]}
          />
        </div>

        <div>
          <Text size="xs" c="dimmed" fw={900} mb={6}>
            정렬
          </Text>
          <SegmentedControl
            fullWidth
            value={metric}
            onChange={(v) => setMetric(v as RankingMetric)}
            data={[
              { label: "AVG", value: "avg" },
              { label: "승률", value: "winRate" },
            ]}
          />
        </div>
      </Group>
    </div>
  );
}
