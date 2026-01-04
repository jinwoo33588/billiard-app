import React from "react";
import StatsOverview from "../components/StatsOverview";
import GameList from "../components/GameList";
import GameUpsertModal from "../components/GameUpsertModal";

import { Stack, Title, Group, Button, Text, Container } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import { useAuth } from "../features/auth/useAuth";
import { useMyGames } from "../features/games/useMyGames";
import { createMyGameApi } from "../features/games/api";

import { useInsights } from "../features/insights/hooks";
import { InsightBadgeRow } from "../features/insights/components/InsightBadges";

export default function HomePage() {
  const { user } = useAuth();
  const { games, refresh } = useMyGames({ limit: 10 });

  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data: insights } = useInsights(10);

  if (!user) return null;

  return (
    <>
      <Container>
        <Stack gap={isMobile ? "sm" : "lg"}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <Title order={isMobile ? 3 : 2}>{user.nickname}님의 기록</Title>
              <Text c="dimmed" size={isMobile ? "sm" : "md"}>
                ({user.handicap}점)
              </Text>
            </Group>

            <Button size={isMobile ? "sm" : "md"} onClick={open}>
              새 경기 기록
            </Button>
          </Group>

          {insights?.all && insights?.teamIndicators && (
            <InsightBadgeRow all={insights.all} team={insights.teamIndicators} />
          )}

          <StatsOverview />


          <GameList games={games} onListChange={refresh} showActions />

          
        </Stack>
      </Container>

      <GameUpsertModal
        opened={opened}
        mode="create"
        onClose={close}
        onSubmit={async (v) => {
          await createMyGameApi({
            score: Number(v.score),
            inning: Number(v.inning),
            result: v.result === "" ? undefined : v.result,
            gameType: v.gameType,
            gameDate: v.gameDate ? v.gameDate.toISOString() : new Date().toISOString(),
            memo: v.memo,
          });
          refresh();
        }}
      />
    </>
  );
}