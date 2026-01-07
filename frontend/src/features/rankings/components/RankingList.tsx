import React from "react";
import { Badge, Card, Group, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import type { RankingRow } from "../types";

type Props = {
  items: RankingRow[];
  mode: "all" | "month";
  myUserId: string | null;
  myGhost: RankingRow | null;
  myRef: React.RefObject<HTMLDivElement | null>;
  onClickUser: (userId: string) => void;
};

export default function RankingList({
  items,
  mode,
  myUserId,
  myGhost,
  myRef,
  onClickUser,
}: Props) {
  if (items.length === 0) {
    return (
      <Text ta="center" mt="md">
        {mode === "month" ? "해당 월 기록이 없습니다." : "랭킹 데이터가 없습니다."}
      </Text>
    );
  }

  return (
    <Stack mt="md" px="xs">
      {items.map((item, index) => {
        const isMe = myUserId && String(item.userId) === String(myUserId);
        const isGhost = !!myGhost && String(item.userId) === String(myGhost.userId);

        const rankNumber = isGhost ? "-" : `#${index + 1}`;

        return (
          <div key={`${item.userId}-${index}`} ref={isMe ? myRef : undefined}>
            <UnstyledButton onClick={() => onClickUser(item.userId)} style={{ width: "100%" }}>
              <Card
                shadow={isMe ? "md" : "sm"}
                p="md"
                radius="md"
                withBorder
                style={{
                  borderWidth: isMe ? 2 : 1,
                  borderColor: isMe ? "#228be6" : undefined,
                  background: isMe ? "rgba(34, 139, 230, 0.08)" : undefined,
                  opacity: isGhost ? 0.88 : 1,
                }}
              >
                <Group justify="space-between" align="flex-start">
                  <Group align="flex-start">
                    <Title order={4} c={isGhost ? "gray" : index < 3 ? "blue" : "gray"}>
                      {rankNumber}
                    </Title>

                    <div>
                      <Group gap={6} wrap="wrap">
                        <Text fw={800}>
                          {item.nickname} ({item.handicap}점)
                        </Text>
                        {isMe && <Badge variant="filled">ME</Badge>}
                        {isGhost && (
                          <Badge variant="light" color="gray">
                            기록없음
                          </Badge>
                        )}
                      </Group>

                      <Text size="xs" c="dimmed">
                        {isGhost
                          ? "이번 달 기록이 없습니다."
                          : `${item.totalGames}전 ${item.wins}승 ${item.draws}무 ${item.losses}패`}
                      </Text>
                    </div>
                  </Group>

                  <Group gap="xs">
                    <div>
                      <Text size="xs" c="dimmed" ta="right">
                        승률
                      </Text>
                      <Text fw={600} ta="right">
                        {(item.winRate || 0).toFixed(1)}%
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed" ta="right">
                        에버리지
                      </Text>
                      <Text fw={600} ta="right">
                        {(item.average || 0).toFixed(3)}
                      </Text>
                    </div>
                  </Group>
                </Group>
              </Card>
            </UnstyledButton>
          </div>
        );
      })}
    </Stack>
  );
}