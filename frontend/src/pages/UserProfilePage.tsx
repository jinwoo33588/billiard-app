import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Stack,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

import Statistics from "../components/StatsOverview";
import GameList from "../components/GameList";
import { useUserProfile } from "../features/users/useUserProfile";

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // ✅ users feature hook 사용 (공개 프로필 + 공개 게임 목록)
  const { user, games, loading, errorMsg, refresh } = useUserProfile({
    userId,
    limit: 100, // 필요하면 줄여도 됨
    enabled: true,
  });

  const totalGames = useMemo(() => games.length, [games]);

  if (loading) {
    return (
      <Center style={{ height: 240 }}>
        <Loader />
      </Center>
    );
  }

  if (errorMsg) {
    return (
      <Container size="sm" px="sm" py="md">
        <Alert icon={<IconAlertCircle size="1rem" />} title="오류 발생!" color="red">
          {errorMsg}
        </Alert>

        <Group mt="md" justify="space-between">
          <Button variant="default" onClick={() => navigate(-1)}>
            뒤로가기
          </Button>
          <Button onClick={refresh}>다시 시도</Button>
        </Group>
      </Container>
    );
  }

  return (
    <Container size="sm" px="sm" py="sm">
      {/* ✅ 모바일 Sticky Header */}
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--mantine-color-body)",
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="xs" c="dimmed">
              프로필
            </Text>

            <Title order={3} style={{ lineHeight: 1.15 }}>
              {user?.nickname ? `${user.nickname}님의 기록` : "사용자 기록"}
            </Title>

            <Text size="xs" c="dimmed">
              총 경기 {totalGames}개
              {typeof user?.handicap === "number" ? ` · 핸디캡 ${user.handicap}` : ""}
            </Text>
          </Box>

          <Button variant="light" onClick={() => navigate(-1)}>
            뒤로
          </Button>
        </Group>

        <Divider mt="sm" />
      </Box>

      <Stack gap="sm" mt="sm">
        <Tabs defaultValue="games" keepMounted={false}>
          <Tabs.List grow>
            <Tabs.Tab value="games">경기</Tabs.Tab>
            <Tabs.Tab value="summary">요약</Tabs.Tab>
          </Tabs.List>

          {/* ✅ 경기 탭 */}
          <Tabs.Panel value="games" pt="sm">
            {games.length === 0 ? (
              <Center style={{ height: 220 }}>
                <Stack gap={6} align="center">
                  <Text fw={600}>공개된 경기 기록이 없어요</Text>
                  <Text size="sm" c="dimmed">
                    기록이 추가되면 여기에 표시됩니다.
                  </Text>
                  <Button variant="light" onClick={refresh} mt="xs">
                    새로고침
                  </Button>
                </Stack>
              </Center>
            ) : (
              // ✅ 프로필 화면에서는 액션(수정/삭제) 숨기고 싶으면
              // GameList가 showActions prop 지원하도록 바꾸는 게 베스트.
              // 지금은 기존 인터페이스 유지: onListChange에 빈 함수
              <GameList games={games} onListChange={() => {}} />
            )}
          </Tabs.Panel>

          {/* ✅ 요약 탭 */}
          <Tabs.Panel value="summary" pt="sm">
            {/* StatsOverview가 현재 "내 기록" 기준이면,
                나중에 games를 받아 유저별로 계산하도록 개편 추천 */}
            <Statistics />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}