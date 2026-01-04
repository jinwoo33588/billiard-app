import React from "react";
import { Center, Container, Loader, Stack, Title, Text } from "@mantine/core";

import UserMonthlyTrends from "../components/UserMonthlyTrends";

import { useMyGames } from "../features/games/useMyGames";
import { useArchive } from "../features/games/useArchive";
import { useMyStats } from "../features/stats/useMyStats";
import { useMyMonthlyStats } from "../features/stats/useMyMonthlyStats";

import ArchiveFilters from "../components/archive/ArchiveFilters";
import ArchiveStats from "../components/archive/ArchiveStats";
import ArchiveRecords from "../components/archive/ArchiveRecords";

export default function ArchivePage() {
  const { games, loading: gamesLoading } = useMyGames();
  const a = useArchive(games);

  // ✅ 선택 기간 통계: 기존 유지 (현재월 기본)
  const { data: statsRes, loading: statsLoading, errorMsg } = useMyStats({
    selector: a.statsSelector,
  });

  // ✅ 월별 변화추이: 항상 전체(all)
  const monthlySelector = { type: "all" } as const;
  const { data: monthlyRes, loading: monthlyLoading, errorMsg: monthlyError } = useMyMonthlyStats({
    selector: monthlySelector,
  });

  if (gamesLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <Container fluid>
      <Stack gap="sm" align="stretch">
        <Title order={2}>기록 보관함</Title>

        {/* ✅ 월별 변화 추이 */}
        {monthlyLoading ? (
          <Center>
            <Loader size="sm" />
          </Center>
        ) : monthlyError ? (
          <Text c="red" size="sm" px="xs">
            {monthlyError}
          </Text>
        ) : (
          <UserMonthlyTrends rows={monthlyRes?.rows ?? []} />
        )}

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

        <ArchiveRecords
          sortedData={a.sortedData}
          sortBy={a.sortBy}
          reverseSortDirection={a.reverseSortDirection}
          setSorting={a.setSorting}
        />
      </Stack>
    </Container>
  );
}