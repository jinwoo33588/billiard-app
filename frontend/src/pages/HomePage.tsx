import React from "react";
import StatsOverview from "../features/stats/components/StatsOverview";
import GameList from "../features/games/components/GameList";
import GameUpsertModal from "../features/games/components/GameUpsertModal";
import { toIso } from "../shared/utils/date"

import { Stack, Title, Group, Button, Text, Container, Badge , Divider, Card} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import { useAuth } from "../features/auth/useAuth";
// import { useMyGames } from "../features/games/useMyGames";
import { createMyGameApi } from "../features/games/api";

import { useMyInsights } from "../features/insights/hooks";
import { InsightBadgeRow } from "../features/insights/components/InsightBadges";

import { useGamesCache } from "../features/games/GamesProvider";

export default function HomePage() {
  const { user } = useAuth();
  const { recentGames, loadingRecent, refreshRecent } = useGamesCache();

  if (!user) return null;

  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // const { data: insights } = useMyInsights(10);

  if (!user) return null;

  return (
    <>
      <Container>
        <Stack gap={isMobile ? "sm" : "lg"}>
        <Group justify="space-between" align="center">
              <div>
            <Title order={4}>종합 통계</Title>
            <Text size="xs" c="dimmed">
              전체 기록과 이번 달 성적
            </Text>
          </div>
          <Badge radius="xl" variant="light">
            전체 · 이번달
          </Badge>
        </Group>
          <StatsOverview />

          <Divider my={isMobile ? "md" : "lg"} />
          <Group justify="space-between" align="center">
            <div>
              <Title order={4}>최근 경기</Title>
              <Text size="xs" c="dimmed">최신 기록부터 보여줘요</Text>
            </div>

            <Text size="xs" c="dimmed">
              {recentGames.length}개
            </Text>
          </Group>

          <GameList
        games={recentGames}
        onListChange={refreshRecent}
        showActions
        // ✅ Home은 “최근 10개” 컨셉이면 더보기 버튼은 빼도 됨
        // onLoadMore / hasMore / loadingMore 제거
      />
        </Stack>
      </Container>


{/* 
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
            gameDate: toIso(v.gameDate),
            memo: v.memo,
          });
          refresh();
        }}
      /> */}
    </>
  );
}