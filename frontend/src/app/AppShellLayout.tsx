// src/app/AppShellLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppShell } from "@mantine/core";

import { useAuth } from "../features/auth/useAuth";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

import GameUpsertModal from "../features/games/components/GameUpsertModal";
import { createMyGameApi } from "../features/games/games.api";
import { emitGamesChanged } from "../features/games/useGames";

export default function AppShellLayout() {
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);

  const openCreate = () => setCreateOpen(true);
  // const closeCreate = () => setCreateOpen(false);

  return (
    <AppShell header={{ height: 56 }} footer={{ height: 72 }} padding={0}>
      <AppShell.Header>
        <TopBar user={user} />
      </AppShell.Header>

      <AppShell.Main>
        <div style={{ height: "calc(100dvh - 56px - 72px)", overflow: "auto", padding: 0 }}>
          <Outlet />
        </div>

        {/* ✅ 모달은 Footer 밖 */}
        <GameUpsertModal
          opened={createOpen}
          onClose={() => setCreateOpen(false)}
          mode="create"
          onSubmit={async (form) => {
            await createMyGameApi({
              score: Number(form.score),
              inning: Number(form.inning),
              result: form.result,
              gameType: form.gameType,
              gameDate: form.gameDate.toISOString(),
              memo: form.memo || "",
            });

            emitGamesChanged();
            setCreateOpen(false);
          }}
        />
      </AppShell.Main>

      <AppShell.Footer>
        <BottomNav onCreate={openCreate} />
      </AppShell.Footer>
    </AppShell>
  );
}
