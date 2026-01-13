import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import {
  AppShell,
  Container,
  Modal,
  Stack,
  Text,
  TextInput,
  NumberInput,
  Group,
  Button,
  Transition,
  ActionIcon,
} from "@mantine/core";
import { IconPencil, IconArrowUp } from "@tabler/icons-react";
import { useAuth } from "../features/auth/useAuth";
import AppHeader from "./AppHeader";
import BottomNav from "./Bottomnav";
import GameUpsertModal from "../features/games/components/GameUpsertModal";
import { createMyGameApi } from "../features/games/api";
import { useGamesCache } from "../features/games/GamesProvider";
import { toIso } from "../shared/utils/date";

export default function AppShellLayout() {
  const { user, logout, updateMe } = useAuth();
  const location = useLocation();
  const { refreshRecent, refreshAll } = useGamesCache();

  // ✅ hooks는 무조건 항상 호출되게 "return 위"에 전부 둔다
  const isAuth = location.pathname.startsWith("/auth");

  const [profileOpen, setProfileOpen] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editHandicap, setEditHandicap] = useState<number>(0);

  const [gameModalOpen, setGameModalOpen] = useState(false);

  // ✅ 스크롤 탑 버튼
  const mainRef = useRef<HTMLDivElement | null>(null);
  const lastYRef = useRef(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    // auth 페이지에서도 훅은 호출되지만, 이벤트는 붙이지 않게 처리 가능
    if (isAuth) return;

    const onScroll = () => {
      const y = window.scrollY;
      setShowTop(y > 400 && y > lastYRef.current);
      lastYRef.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [isAuth]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openNewGame = () => setGameModalOpen(true);
  const closeNewGame = () => setGameModalOpen(false);

  const openProfile = () => {
    if (!user) return;
    setEditNickname(user.nickname ?? "");
    setEditHandicap(Number(user.handicap ?? 0));
    setProfileOpen(true);
  };

  const saveProfile = async () => {
    await updateMe({ nickname: editNickname.trim(), handicap: Number(editHandicap) || 0 });
    setProfileOpen(false);
  };

  // ✅ 이제 return은 hooks 다음에!
  if (isAuth) return <Outlet />;

  return (
    <AppShell
      padding={0}
      header={{ height: 60 }}
      footer={user ? { height: 64 } : undefined}
      styles={{ main: { paddingBottom: user ? 76 : 0 } }}
    >
      <AppShell.Header>
        <AppHeader user={user} onOpenProfile={openProfile} onLogout={logout} />
      </AppShell.Header>

      {user && (
        <AppShell.Footer>
          <BottomNav onCreateGame={openNewGame} />
        </AppShell.Footer>
      )}

      <AppShell.Main>
        <div
          ref={mainRef}
          style={{
            height: "100%",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: user ? 76 : 0,
          }}
        >
          <Container size="sm" px="sm" py="sm">
            <Outlet />
          </Container>
        </div>

        <Transition mounted={showTop} transition="fade-up" duration={200} timingFunction="ease">
          {(styles) => (
            <ActionIcon
              style={{
                ...styles,
                position: "fixed",
                right: 16,
                bottom: user ? 96 : 24,
                zIndex: 3000,
              }}
              onClick={scrollToTop}
              radius="xl"
              size={48}
            >
              <IconArrowUp size={22} />
            </ActionIcon>
          )}
        </Transition>

        <Modal opened={profileOpen} onClose={() => setProfileOpen(false)} title="프로필 수정" centered>
          <Stack>
            <Text size="sm" c="dimmed">닉네임과 핸디캡(내 점수)을 수정할 수 있어요.</Text>

            <TextInput
              label="닉네임"
              value={editNickname}
              onChange={(e) => setEditNickname(e.currentTarget.value)}
              placeholder="예: jinwoo"
              rightSection={<IconPencil size={16} />}
            />

            <NumberInput
              label="핸디캡(점수)"
              value={editHandicap}
              onChange={(v) => setEditHandicap(Number(v) || 0)}
              min={0}
              clampBehavior="strict"
              placeholder="예: 25"
            />

            <Group justify="flex-end">
              <Button variant="default" onClick={() => setProfileOpen(false)}>취소</Button>
              <Button onClick={saveProfile} disabled={!editNickname.trim()}>저장</Button>
            </Group>
          </Stack>
        </Modal>

        <GameUpsertModal
          opened={gameModalOpen}
          mode="create"
          onClose={closeNewGame}
          onSubmit={async (v) => {
            await createMyGameApi({
              score: Number(v.score),
              inning: Number(v.inning),
              result: v.result === "" ? undefined : v.result,
              gameType: v.gameType,
              gameDate: toIso(v.gameDate),
              memo: v.memo,
            });
            closeNewGame();
            await refreshRecent();
            refreshAll();
          }}
        />
      </AppShell.Main>
    </AppShell>
  );
}