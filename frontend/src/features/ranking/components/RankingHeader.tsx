import { SegmentedControl, Text } from "@mantine/core";
import type { RankingMode } from "../types";

export default function RankingHeader({
  mode,
  setMode,
  monthValue,
}: {
  mode: RankingMode;
  setMode: (v: RankingMode) => void;
  monthValue?: string | null;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Text
          fw={950}
          style={{ letterSpacing: -0.3, fontSize: 18, lineHeight: 1.1 }}
        >
          랭킹
        </Text>
        {monthValue ? (
          <Text size="xs" c="dimmed" mt={6} lineClamp={1}>
            {monthValue}
          </Text>
        ) : null}
      </div>

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
    </div>
  );
}
