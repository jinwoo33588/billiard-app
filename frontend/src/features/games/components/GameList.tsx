// frontend/src/features/games/components/GameList.tsx
import React, { useMemo, useState, useEffect } from "react";
import { Text, Group, Stack, Divider, Button } from "@mantine/core";

import GameRow from "./GameRow";
import GameUpsertModal, { GameUpsertValues } from "./GameUpsertModal";

import type { Game } from "../types";
import { deleteMyGameApi, updateMyGameApi } from "../api";

// ✅ insights 연결용
import type { TeamGameRow } from "../../insights/types";
import type { OutcomeCategory } from "../../insights/utils/teamOutcome";
import { classifyTeamOutcome } from "../../insights/utils/teamOutcome";
import type { GameRowDetailData } from "./GameRowDetail";

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

  /** ✅ Insights(팀전 gps) 매핑 */
  teamMap?: Map<string, TeamGameRow>;
  expected?: number; // benchmark.expected (기대 에버)
  insightsLoading?: boolean;
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

  teamMap,
  expected = 0,
  insightsLoading = false,
}: GameListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // ✅ 펼침(상세) 상태: 한 번에 한 개만
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ✅ 로컬 슬라이스 방식(옵션)
  const [visibleCount, setVisibleCount] = useState(
    enableLocalPagination ? initialLimit : games.length
  );

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

  const handleShowMoreLocal = () =>
    setVisibleCount((prev) => Math.min(prev + initialLimit, games.length));
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

      // ✅ 핵심: string 그대로 보냄 ("YYYY-MM-DD")
      gameDate: values.gameDate || String(editingGame.gameDate).slice(0, 10),

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
          {visibleGames.map((game) => {
            const row = teamMap?.get(String(game._id));

            // ✅ outcome 태그(팀전 row가 있을 때만)
            const outcome: OutcomeCategory | null = row
              ? classifyTeamOutcome({
                  gps: row.gps,
                  result: row.result,
                  goodCut: 55,
                  badCut: 45,
                })
              : null;

            // ✅ 상세(detail): gps / expectedScore / memo
            const detail: GameRowDetailData = {
              gps: row?.gps,
              expectedScore: row
                ? (Number(expected) || 0) * (Number(row.inning) || 0)
                : undefined,
              memo: (game as any).memo ?? "",
            };

            const isExpanded = expandedId === String(game._id);

            return (
              <GameRow
                key={game._id}
                game={game}
                showActions={showActions}
                onEdit={() => setEditingGame(game)}
                onDelete={handleDelete}
                expanded={isExpanded}
                onToggleExpand={() =>
                  setExpandedId((prev) => (prev === String(game._id) ? null : String(game._id)))
                }
                outcome={outcome}
                detail={detail}
              />
            );
          })}

          {insightsLoading && (
            <Text size="xs" c="dimmed" style={{ paddingLeft: 4 }}>
              팀전 GPS 분석 불러오는 중…
            </Text>
          )}

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