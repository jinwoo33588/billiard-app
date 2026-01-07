import React from "react";
import {
  Center,
  Container,
  Loader,
  Stack,
  Title,
  Text,
  Group,
  Badge,
  Divider,
  Button,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import UserMonthlyTrends from "../features/stats/components/UserMonthlyTrends";

// import { useMyGames } from "../features/games/useMyGames";
import { useArchive } from "../features/games/useArchive";
import { useMyStats } from "../features/stats/useMyStats";
import { useMyMonthlyStats } from "../features/stats/useMyMonthlyStats";
import { useGamesCache } from "../features/games/GamesProvider";

import ArchiveFilters from "../features/games/components/archive/ArchiveFilters";
import ArchiveStats from "../features/games/components/archive/ArchiveStats";



// ✅ Home에서 쓰던 컴포넌트들
import GameList from "../features/games/components/GameList";
import GameUpsertModal from "../features/games/components/GameUpsertModal";
import { createMyGameApi } from "../features/games/api";
import { toIso } from "../shared/utils/date";

export default function ArchivePage() {
  // ✅ GameList props 맞추려고 Home과 동일한 useMyGames 시그니처 사용
  // const { games, refresh, loadMore, hasMore, loadingMore, loading } = useMyGames({
  //   limit: 10,
  //   step: 10,
  // });

  const { allGames, loadingAll, refreshAll, allReady } = useGamesCache();

  const a = useArchive(allGames);

  // ✅ 선택 기간 통계: 기존 유지 (현재월 기본)
  const { data: statsRes, loading: statsLoading, errorMsg } = useMyStats({
    selector: a.statsSelector,
  });

  // ✅ 월별 변화추이: 항상 전체(all)
  const monthlySelector = { type: "all" } as const;
  const {
    data: monthlyRes,
    loading: monthlyLoading,
    errorMsg: monthlyError,
  } = useMyMonthlyStats({
    selector: monthlySelector,
  });

  // ✅ Upsert modal
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (loadingAll) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Container fluid>
        <Stack gap={isMobile ? "sm" : "lg"} align="stretch">
          <Group justify="space-between" align="center">
            <div>
              <Title order={2}>기록 보관함</Title>
              
            </div>
          </Group>

          {/* ✅ 월별 변화 추이 */}
          {/* {monthlyLoading ? (
            <Center>
              <Loader size="sm" />
            </Center>
          ) : monthlyError ? (
            <Text c="red" size="sm" px="xs">
              {monthlyError}
            </Text>
          ) : (
            <UserMonthlyTrends rows={monthlyRes?.rows ?? []} />
          )} */}

          {/* <Divider my={isMobile ? "sm" : "md"} /> */}

          <ArchiveFilters
            dateRange={a.dateRange}
            setDateRange={a.setDateRange}
            filterMode={a.filterMode}
            setFilterMode={a.setFilterMode}
            years={a.years}
            selectedYear={a.selectedYear}
            setSelectedYear={a.setSelectedYear}
            monthsInYear={a.monthsInYear}
            selectedMonth0={a.selectedMonth0}
            setSelectedMonth0={a.setSelectedMonth0}
            monthCounts={a.monthCounts}
            pillVariant={a.pillVariant}
            clearAllFilters={a.clearAllFilters}
          />

          {/* ✅ 선택 기간 통계 */}
          {errorMsg ? (
            <Text c="red" size="sm" px="xs">
              {errorMsg}
            </Text>
          ) : (
            <ArchiveStats stats={statsRes?.stats} loading={statsLoading} />
          )}

          <Divider my={isMobile ? "sm" : "md"} />

          {/* ✅ ArchiveRecords 대신 GameList */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={4}>기록 목록</Title>
              <Text size="xs" c="dimmed">
                필터/정렬 결과로 보여줘요
              </Text>
            </div>
            <Text size="xs" c="dimmed">
              {a.sortedData.length}개
            </Text>
          </Group>
          <GameList
        games={a.sortedData}
        onListChange={refreshAll}
        showActions
        // ✅ 이제 Archive에서 더보기는 “전체 캐시” 기반이라 필요 없을 가능성이 큼
      />
        </Stack>
      </Container>

      {/* ✅ Home과 동일하게 UpsertModal 포함 */}
      {/* <GameUpsertModal
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