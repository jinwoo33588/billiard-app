import React from "react";
import {
  Card,
  Group,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
  Center,
  rem,
} from "@mantine/core";
import { IconSelector, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";

import type { Game } from "../../features/games/types";
import { resultLabel, gameTypeLabel } from "../../features/games/label";

type ThProps = {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
};

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center>
            <Icon style={{ width: rem(16), height: rem(16) }} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

type Props = {
  // ✅ 이미 정렬/필터된 데이터
  sortedData: Game[];

  // ✅ 정렬 UI 상태 (로직은 훅에서)
  sortBy: keyof Game | null;
  reverseSortDirection: boolean;
  setSorting: (field: keyof Game) => void;
};

export default function ArchiveRecords({
  sortedData,
  sortBy,
  reverseSortDirection,
  setSorting,
}: Props) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Stack p="sm">
      <Title order={3} mb="md">
        상세 기록
      </Title>

      {isDesktop ? (
        <Table.ScrollContainer minWidth={650}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Th
                  sorted={sortBy === "gameDate"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("gameDate")}
                >
                  날짜
                </Th>
                <Th
                  sorted={sortBy === "gameType"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("gameType")}
                >
                  방식
                </Th>
                <Th
                  sorted={sortBy === "result"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("result")}
                >
                  결과
                </Th>
                <Th
                  sorted={sortBy === "score"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("score")}
                >
                  점수
                </Th>
                <Th
                  sorted={sortBy === "inning"}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting("inning")}
                >
                  이닝
                </Th>
                <Table.Th>에버</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {sortedData.map((game) => (
                <Table.Tr key={game._id}>
                  <Table.Td>{new Date(game.gameDate).toLocaleDateString("ko-KR")}</Table.Td>
                  <Table.Td>{gameTypeLabel(game.gameType)}</Table.Td>
                  <Table.Td>{resultLabel(game.result)}</Table.Td>
                  <Table.Td>{game.score}</Table.Td>
                  <Table.Td>{game.inning}</Table.Td>
                  <Table.Td>{game.inning > 0 ? (game.score / game.inning).toFixed(3) : "-"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Stack>
          {sortedData.length > 0 ? (
            sortedData.map((game) => (
              <Card key={game._id} withBorder p="sm" radius="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Text fw={600}>{new Date(game.gameDate).toLocaleDateString("ko-KR")}</Text>
                    <Text size="xs" c="dimmed">
                      {gameTypeLabel(game.gameType)}
                    </Text>
                  </div>
                  <Text size="xl" fw={800}>
                    {resultLabel(game.result)}
                  </Text>
                </Group>

                <Group grow mt="xs">
                  <Text size="sm">이닝: {game.inning}</Text>
                  <Text size="sm">점수: {game.score}</Text>
                  <Text size="sm">
                    Avg: {game.inning > 0 ? (game.score / game.inning).toFixed(3) : "-"}
                  </Text>
                </Group>
              </Card>
            ))
          ) : (
            <Text c="dimmed" ta="center">
              해당 기간의 기록이 없습니다.
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}