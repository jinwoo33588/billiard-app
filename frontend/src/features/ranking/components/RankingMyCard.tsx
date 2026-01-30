import { useMemo } from "react";
import { Text } from "@mantine/core";
import InsightCardShell from "../../insights/components/InsightCardShell";
import type { RankingItem } from "../types";
import RankingRow from "./RankingRow";

export default function RankingMyCard({
  items,
  myUserId,
}: {
  items: RankingItem[];
  myUserId: string | null;
}) {
  const myItem = useMemo(() => {
    if (!myUserId) return null;
    return items.find((it) => it.user.id === myUserId) ?? null;
  }, [items, myUserId]);

  if (!myItem) return null;

  return (
    <InsightCardShell>
      <Text size="xs" c="dimmed" fw={900} style={{ margin: "2px 2px 8px" }}>
        내 순위
      </Text>
      <RankingRow item={myItem} myUserId={myUserId} variant="meCard" />
    </InsightCardShell>
  );
}
