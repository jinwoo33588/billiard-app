import { Text } from "@mantine/core";
import InsightCardShell from "../../insights/components/InsightCardShell";
import type { RankingItem } from "../types";
import RankingRow from "./RankingRow";

export default function RankingList({
  items,
  myUserId,
}: {
  items: RankingItem[];
  myUserId: string | null;
}) {
  return (
    <InsightCardShell>
      {items.length === 0 ? (
        <Text size="sm" c="dimmed">
          표시할 랭킹이 없습니다.
        </Text>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((it) => (
            <RankingRow key={it.user.id} item={it} myUserId={myUserId} />
          ))}
        </div>
      )}
    </InsightCardShell>
  );
}
