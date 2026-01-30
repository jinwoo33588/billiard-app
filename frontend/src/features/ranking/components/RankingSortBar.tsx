import { ActionIcon, Group, SegmentedControl } from "@mantine/core";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import type { RankingSortDirection, RankingSortMetric } from "../types";

export default function RankingSortBar({
  metric,
  setMetric,
  sortDirection,
  setSortDirection,
}: {
  metric: RankingSortMetric;
  setMetric: (v: RankingSortMetric) => void;
  sortDirection: RankingSortDirection;
  setSortDirection: (v: RankingSortDirection) => void;
}) {
  return (
    <Group justify="center" align="center" wrap="nowrap">
      <SegmentedControl
        value={metric}
        onChange={(v) => setMetric(v as RankingSortMetric)}
        data={[
          { label: "AVG", value: "avg" },
          { label: "승률", value: "winRate" },
          { label: "핸디", value: "handicap" },
        ]}
      />

      <ActionIcon
        variant="light"
        size="lg"
        radius="md"
        onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}
        aria-label={sortDirection === "desc" ? "높은순" : "낮은순"}
        title={sortDirection === "desc" ? "높은순" : "낮은순"}
        style={{ border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {sortDirection === "desc" ? <IconSortDescending size={18} /> : <IconSortAscending size={18} />}
      </ActionIcon>
    </Group>
  );
}
