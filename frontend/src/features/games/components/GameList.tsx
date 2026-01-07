import React, { useMemo, useState, useEffect } from "react";
import { Text, Group, Stack, Divider, Button } from "@mantine/core";

import GameRow from "./GameRow";
import GameUpsertModal, { GameUpsertValues } from "./GameUpsertModal";

import type { Game } from "../types";
import { deleteMyGameApi, updateMyGameApi } from "../api";

interface GameListProps {
  games: Game[];
  onListChange?: () => void;
  showActions?: boolean;

  /** ✅ “서버 더보기”를 쓰면 밖에서 games를 늘려줌 */
  onLoadMore?: () => Promise<void> | void;
  hasMore?: boolean;
  loadingMore?: boolean;

  /** ✅ “프론트 더보기(슬라이스)”를 계속 쓰고 싶으면 옵션 */
  initialLimit?: number;
  enableLocalPagination?: boolean;
}

export default function GameList({
  games,
  onListChange = () => {},
  showActions = false,

  onLoadMore,
  hasMore,
  loadingMore = false,

  initialLimit = 10,
  enableLocalPagination = false,
}: GameListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // ✅ 로컬 슬라이스 방식(옵션)
  const [visibleCount, setVisibleCount] = useState(enableLocalPagination ? initialLimit : games.length);

  useEffect(() => {
    if (!enableLocalPagination) {
      setVisibleCount(games.length);
      return;
    }
    setVisibleCount((prev) => Math.min(Math.max(prev, initialLimit), games.length));
  }, [games.length, enableLocalPagination, initialLimit]);

  const visibleGames = useMemo(() => {
    if (!enableLocalPagination) return games;
    return games.slice(0, visibleCount);
  }, [games, visibleCount, enableLocalPagination]);

  const canShowMoreLocal = enableLocalPagination && visibleCount < games.length;

  const handleShowMoreLocal = () => setVisibleCount((prev) => Math.min(prev + initialLimit, games.length));
  const handleCollapseLocal = () => setVisibleCount(Math.min(initialLimit, games.length));

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

    setEditingGame(null);
    onListChange();
  };

  const showEmpty = games.length === 0;

  return (
    <>
      {showEmpty ? (
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

          {/* ✅ 서버 더보기 버튼 */}
          {onLoadMore && typeof hasMore === "boolean" && (
            <>
              <Divider my={4} />
              <Group justify="center">
                <Button
                  variant="light"
                  radius="xl"
                  onClick={onLoadMore}
                  loading={loadingMore}
                  disabled={!hasMore}
                >
                  {hasMore ? "더보기" : "끝"}
                </Button>
              </Group>
            </>
          )}

          {/* ✅ 로컬 더보기(슬라이스) 버튼 */}
          {enableLocalPagination && games.length > initialLimit && !onLoadMore && (
            <>
              <Divider my={4} />
              <Group justify="center">
                {canShowMoreLocal ? (
                  <Button variant="light" radius="xl" onClick={handleShowMoreLocal}>
                    더보기 (+{Math.min(initialLimit, games.length - visibleCount)}개)
                  </Button>
                ) : (
                  <Button variant="subtle" radius="xl" onClick={handleCollapseLocal}>
                    접기
                  </Button>
                )}
              </Group>
            </>
          )}
        </Stack>
      )}

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