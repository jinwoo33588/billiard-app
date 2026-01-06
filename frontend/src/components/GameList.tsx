import React, { useMemo, useState, useEffect } from "react";
import { Text, Group, Stack, Title, Divider, Button } from "@mantine/core";

import GameRow from "./game/GameRow";
import GameUpsertModal, { GameUpsertValues } from "./GameUpsertModal";

import type { Game } from "../features/games/types";
import { deleteMyGameApi, updateMyGameApi } from "../features/games/api";

interface GameListProps {
  games: Game[];
  onListChange?: () => void;
  showActions?: boolean;
  initialLimit?: number; // default 10
  enablePagination?: boolean; // default true
}

export default function GameList({
  games,
  onListChange = () => {},
  showActions = false,
  initialLimit = 10,
  enablePagination = true,
}: GameListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const [visibleCount, setVisibleCount] = useState(enablePagination ? initialLimit : games.length);

  useEffect(() => {
    if (!enablePagination) {
      setVisibleCount(games.length);
      return;
    }
    setVisibleCount((prev) => Math.min(Math.max(prev, initialLimit), games.length));
  }, [games.length, enablePagination, initialLimit]);

  const visibleGames = useMemo(() => {
    if (!enablePagination) return games;
    return games.slice(0, visibleCount);
  }, [games, visibleCount, enablePagination]);

  const canShowMore = enablePagination && visibleCount < games.length;

  const handleShowMore = () => setVisibleCount((prev) => Math.min(prev + initialLimit, games.length));
  const handleCollapse = () => setVisibleCount(Math.min(initialLimit, games.length));

  const handleDelete = async (gameId: string) => {
    if (!window.confirm("정말로 이 기록을 삭제하시겠습니까?")) return;
    await deleteMyGameApi(gameId);
    onListChange();
  };

  const handleEditSubmit = async (values: GameUpsertValues) => {
    if (!editingGame) return;

    await updateMyGameApi(editingGame._id, {
      score: Number(values.score),
      inning: Number(values.inning),
      result: values.result === "" ? undefined : values.result,
      gameType: values.gameType,
      gameDate: values.gameDate ? values.gameDate.toISOString() : editingGame.gameDate,
      memo: values.memo,
    });

    onListChange();
  };

  return (
    <>
      <Stack>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={3}>최근 경기 기록 (10 경기)</Title>
          {enablePagination && games.length > 0 && (
            <Text size="xs" c="dimmed">
              {Math.min(visibleCount, games.length)} / {games.length}
            </Text>
          )}
        </Group>

        {games.length === 0 ? (
          <Text>기록된 경기가 없습니다.</Text>
        ) : (
          <Stack gap="xs">
            {visibleGames.map((game) => (
              <GameRow
                key={game._id}
                game={game}
                showActions={showActions}
                onEdit={() => setEditingGame(game)}
                onDelete={handleDelete}
              />
            ))}

            {enablePagination && games.length > initialLimit && (
              <>
                <Divider my={4} />
                <Group justify="center">
                  {canShowMore ? (
                    <Button variant="light" radius="xl" onClick={handleShowMore}>
                      더보기 (+{Math.min(initialLimit, games.length - visibleCount)}개)
                    </Button>
                  ) : (
                    <Button variant="subtle" radius="xl" onClick={handleCollapse}>
                      접기
                    </Button>
                  )}
                </Group>
              </>
            )}
          </Stack>
        )}
      </Stack>

      <GameUpsertModal
        opened={!!editingGame}
        mode="edit"
        initial={editingGame ?? undefined}
        onClose={() => setEditingGame(null)}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}