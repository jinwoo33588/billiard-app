import React, { useState , useEffect, useRef} from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppShell, Container, Modal, Stack, Text, TextInput, NumberInput, Group, Button, Transition } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import { useAuth } from "../features/auth/useAuth";
import AppHeader from "./AppHeader";
import BottomNav from "./Bottomnav";
import GameUpsertModal from "../features/games/components/GameUpsertModal";
import { createMyGameApi } from "../features/games/api";
import { useGamesCache } from "../features/games/GamesProvider"; 
import { toIso } from "../shared/utils/date";
import { ActionIcon } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons-react";


export default function AppShellLayout() {
  const { user, logout, updateMe } = useAuth();
  const location = useLocation();

  const { refreshRecent, refreshAll } = useGamesCache();

  const [profileOpen, setProfileOpen] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editHandicap, setEditHandicap] = useState<number>(0);

  const [gameModalOpen, setGameModalOpen] = useState(false);

// 홈의 리스트 갱신도 같이 하고 싶으면 Layout에서 hook을 한 번 더 잡는 게 가장 단순함

const openNewGame = () => setGameModalOpen(true);
const closeNewGame = () => setGameModalOpen(false);
 

  const isAuth = location.pathname.startsWith("/auth");
  if (isAuth) return <Outlet />;

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

// 스크롤 버튼
const mainRef = useRef<HTMLDivElement | null>(null);
const [showTop, setShowTop] = useState(false);
let lastY = 0;

useEffect(() => {
  const onScroll = () => {
    const y = window.scrollY;
    setShowTop(y > 400 && y > lastY);
    lastY = y;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  return () => window.removeEventListener("scroll", onScroll);
}, []);

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};



  return (
    <AppShell
      padding={0}
      header={{ height: 60 }}
      footer={user ? { height: 64 } : undefined}
      styles={{
        main: { paddingBottom: user ? 76 : 0 },
      }}
    >
      <AppShell.Header>
      <AppHeader
    user={user}
    onOpenProfile={openProfile}
    onLogout={logout}
    
  />
      </AppShell.Header>

      {user && (
        <AppShell.Footer>
          <BottomNav onCreateGame={openNewGame} />
        </AppShell.Footer>
      )}

      <AppShell.Main>
        {/* ✅ 실제 스크롤 컨테이너 */}
  <div
    ref={mainRef}
    style={{
      height: "100%",
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      paddingBottom: user ? 76 : 0, // 바텀네비 만큼
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
      className="scrollTopBtn"
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
            <Text size="sm" c="dimmed">
              닉네임과 핸디캡(내 점수)을 수정할 수 있어요.
            </Text>

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
              <Button variant="default" onClick={() => setProfileOpen(false)}>
                취소
              </Button>
              <Button onClick={saveProfile} disabled={!editNickname.trim()}>
                저장
              </Button>
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
            refreshAll(); // ✅ 홈/아카이브 리스트 즉시 갱신
          }}
        />
        
      </AppShell.Main>
    </AppShell>
  );
}