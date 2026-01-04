import React from "react";
import { Card, SimpleGrid, Text, Title, Stack, Loader, Center } from "@mantine/core";
import type { FullStats } from "../../features/stats";

type Props = {
  stats?: FullStats | null;
  loading?: boolean;
};

export default function ArchiveStats({ stats, loading }: Props) {
  return (
    <Stack p="sm">
      <Title order={3} mb="md">
        선택 기간 통계
      </Title>

      <Card p="sm" radius="md" withBorder>
        {loading ? (
          <Center py="md">
            <Loader size="sm" />
          </Center>
        ) : !stats ? (
          <Text c="dimmed" ta="center" py="md">
            통계 데이터가 없습니다.
          </Text>
        ) : (
          <SimpleGrid cols={2} spacing="sm" verticalSpacing="xs">
            <div>
              <Text size="xs" c="dimmed" ta="center">
                총 게임 수
              </Text>
              <Text size="lg" fw={700} ta="center">
                {stats.totalGames}판
              </Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" ta="center">
                총 전적
              </Text>
              <Text size="lg" fw={700} ta="center">
                {stats.wins}승 {stats.draws}무 {stats.losses}패
              </Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" ta="center">
                승률
              </Text>
              <Text size="lg" fw={700} ta="center">
                {stats.winRate.toFixed(1)}%
              </Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" ta="center">
                에버리지
              </Text>
              <Text size="lg" fw={700} ta="center">
                {stats.average.toFixed(3)}
              </Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" ta="center">
                최고 에버
              </Text>
              <Text size="lg" fw={700} ta="center">
                {stats.bestAverage.toFixed(3)}
              </Text>
            </div>

            <div>
              <Text size="xs" c="dimmed" ta="center">
                최고 점수
              </Text>
              <Text size="lg" fw={700} ta="center">
                {stats.bestScore}점
              </Text>
            </div>
          </SimpleGrid>
        )}
      </Card>
    </Stack>
  );
}