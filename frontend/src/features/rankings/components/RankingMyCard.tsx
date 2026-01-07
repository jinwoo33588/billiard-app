import React from "react";
import { Badge, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconTarget } from "@tabler/icons-react";
import type { RankingRow } from "../types";

type Props = {
  me: RankingRow | null;
  myGhost: RankingRow | null;
  myRankLabel: string;
  myRef: React.RefObject<HTMLDivElement | null>;
};

export default function RankingMyCard({ me, myGhost, myRankLabel, myRef }: Props) {
  const mine = me ?? myGhost;
  if (!mine) return null;

  return (
    <Stack gap="xs" px="xs">
      <Card
        withBorder
        radius="md"
        p="md"
        style={{
          position: "sticky",
          top: 8,
          zIndex: 10,
          background: "white",
        }}
      >
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap={8}>
              <Badge variant="filled">ME</Badge>
              <Text size="xs" c="dimmed">
                내 순위
              </Text>
            </Group>

            <Text fw={900} style={{ fontSize: 18 }}>
              {myRankLabel}
            </Text>

            <Text size="sm" fw={800}>
              {mine.nickname} ({mine.handicap}점)
            </Text>

            {!me && (
              <Text size="xs" c="dimmed" mt={4}>
                이번 달 기록이 없어서 랭킹에 집계되지 않았어요.
              </Text>
            )}
          </div>

          <Group gap="xl">
            <div>
              <Text size="xs" c="dimmed" ta="right">
                승률
              </Text>
              <Text fw={800} ta="right">
                {(mine.winRate || 0).toFixed(1)}%
              </Text>
            </div>
            <div>
              <Text size="xs" c="dimmed" ta="right">
                에버리지
              </Text>
              <Text fw={800} ta="right">
                {(mine.average || 0).toFixed(3)}
              </Text>
            </div>
          </Group>
        </Group>

        <Group justify="flex-end" mt="sm">
          <Button
            size="xs"
            variant="light"
            leftSection={<IconTarget size={16} />}
            onClick={() => myRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
          >
            내 위치로
          </Button>
        </Group>
      </Card>
    </Stack>
  );
}