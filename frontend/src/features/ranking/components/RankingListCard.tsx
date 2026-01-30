import React, { useMemo } from "react";
import { Group, Text, Divider, Button } from "@mantine/core";
import InsightCardShell from "../../insights/components/InsightCardShell";
import type { RankingResponse } from "../types";
import RankingRow from "./RankingRow";

export default function RankingListCard({
  data,
  loading,
  error,
  onReload,
  myUserId,
}: {
  data: RankingResponse | null;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  myUserId: string | null;
}) {
  const myItem = useMemo(() => {
    if (!data || !myUserId) return null;
    return data.items.find((it) => it.user.id === myUserId) ?? null;
  }, [data, myUserId]);

  return (
    <InsightCardShell>
      <Group justify="space-between" align="center">
        <div style={{ minWidth: 0 }}>
          <Text fw={950} style={{ letterSpacing: -0.3 }}>
            랭킹
          </Text>
          <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
            {data
              ? `${data.window.mode === "thisMonth" ? "이번달" : "전체"} · ${data.metric === "avg" ? "AVG" : "승률"} 기준`
              : ""}
          </Text>
        </div>

        <Button size="xs" variant="light" radius="xl" onClick={onReload}>
          새로고침
        </Button>
      </Group>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      {loading ? <Text size="sm" c="dimmed">Loading...</Text> : null}
      {error ? <Text size="sm" c="red" style={{ whiteSpace: "pre-wrap" }}>{error}</Text> : null}

      {!loading && !error && data ? (
        <div style={{ display: "grid", gap: 10 }}>
          {/* ✅ 내 카드(있으면) */}
          {myItem ? (
            <div>
              <Text size="xs" c="dimmed" fw={900} style={{ margin: "2px 2px 8px" }}>
                내 순위
              </Text>
              <RankingRow item={myItem} myUserId={myUserId} variant="meCard" />
              <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />
            </div>
          ) : null}

          {/* ✅ 전체 리스트(원래대로) */}
          {data.items.map((it) => (
            <RankingRow key={it.user.id} item={it} myUserId={myUserId} />
          ))}
        </div>
      ) : null}
    </InsightCardShell>
  );
}
