import React, { useState } from "react";
import { Alert, Container, Loader, Stack, Text, Button, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";

import { useDashboard } from "../features/reports/useDashboard";
import DashboardKpis from "../features/reports/components/DashboardKpis";
import RecentGameList2 from "../features/reports/components/RecentGameList2";

import { getMyGameApi } from "../features/games/api";
import type { Game } from "../features/games/types";
import GameEditorModal from "../features/games/components/GameEditorModal";

export default function HomePage() {
  const navigate = useNavigate();

  // ✅ 모달 상태는 컴포넌트 내부에 있어야 함
  const [editOpen, setEditOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // 홈에서 필요한 대시보드 옵션만 설정
  const { data, loading, error, refetch } = useDashboard({
    recent: 10,
    includeRecentGames: true,
    includeGps: true,
  });

  // ✅ edit 클릭 시: 단건 조회 후 모달 오픈
  async function onEdit(gameId: string) {
    try {
      setEditError(null);
      setEditLoading(true);

      const game = await getMyGameApi(gameId);
      setEditingGame(game);
      setEditOpen(true);
    } catch (e: any) {
      setEditError(e?.response?.data?.message ?? "게임 정보를 불러오지 못했습니다.");
    } finally {
      setEditLoading(false);
    }
  }

  function closeEdit() {
    setEditOpen(false);
    setEditingGame(null);
    setEditError(null);
  }

  return (
    <Container size="sm" py="md">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={900} size="xl">
            홈
          </Text>

          <Button variant="light" size="xs" onClick={() => navigate("/archive")}>
            전체 기록
          </Button>
        </Group>

        {/* ✅ 편집 모달은 return 내부에 렌더되어야 함 */}
        <GameEditorModal
          opened={editOpen}
          mode="edit"
          initialGame={editingGame}
          onClose={closeEdit}
          onSuccess={() => {
            closeEdit();
            // ✅ 수정 성공 후 대시보드 다시 불러오기
            refetch?.();
          }}
        />

        {/* (선택) edit 단건조회 로딩/에러 표시 */}
        {editLoading ? (
          <Alert color="gray" title="불러오는 중">
            게임 상세를 불러오는 중입니다.
          </Alert>
        ) : null}
        {editError ? (
          <Alert color="red" title="편집 준비 실패">
            {editError}
          </Alert>
        ) : null}

        {/* 1) 로딩 */}
        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : null}

        {/* 2) 에러 */}
        {!loading && error ? (
          <Alert color="red" title="불러오기 실패">
            대시보드 데이터를 불러오지 못했습니다.
          </Alert>
        ) : null}

        {/* 3) 데이터 없음 */}
        {!loading && !error && !data ? (
          <Alert color="gray" title="데이터 없음">
            표시할 데이터가 없습니다.
          </Alert>
        ) : null}

        {/* 4) 정상 데이터 */}
        {!loading && !error && data ? (
          <>
            <DashboardKpis recent={data.recent} thisMonth={data.thisMonth} />

            {data.recentGames && data.recentGames.length > 0 ? (
              <RecentGameList2
                games={data.recentGames}
                showActions
                onEdit={onEdit}
              />
            ) : (
              <Alert color="gray" title="최근 게임 없음">
                아직 기록된 게임이 없습니다.
              </Alert>
            )}
          </>
        ) : null}
      </Stack>
    </Container>
  );
}
