import React from "react";
import { ActionIcon, Group, SegmentedControl } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import type { RankingRow } from "../types";

type SortBy = keyof Pick<RankingRow, "average" | "winRate" | "handicap">;

type Props = {
  sortBy: SortBy;
  sortDirection: "desc" | "asc";
  handleSortChange: (v: string) => void;
  toggleSortDirection: () => void;
};

export default function RankingSortBar({
  sortBy,
  sortDirection,
  handleSortChange,
  toggleSortDirection,
}: Props) {
  return (
    <Group justify="center">
      <SegmentedControl
        value={sortBy}
        onChange={handleSortChange}
        data={[
          { label: "에버리지", value: "average" },
          { label: "승률", value: "winRate" },
          { label: "핸디", value: "handicap" },
        ]}
      />
      <ActionIcon variant="default" size="lg" onClick={toggleSortDirection}>
        {sortDirection === "desc" ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />}
      </ActionIcon>
    </Group>
  );
}