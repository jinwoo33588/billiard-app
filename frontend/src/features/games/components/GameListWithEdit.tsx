import { useState } from "react";
import type { Game } from "../types";
import GameList from "./GameList";
import GameUpsertModal from "./GameUpsertModal";

import { updateMyGameApi, deleteMyGameApi } from "../games.api";
import { emitGamesChanged } from "../useGames";

type Props = {
  games: Game[];
};

export default function GameListWithEdit({ games }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);

  const openEdit = (g: Game) => {
    setEditing(g);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
  };

  // ✅ edit submit => update API
  const handleEditSubmit = async (form: any) => {
    if (!editing) return;

    await updateMyGameApi(editing.id, {
      // number | "" => number 로 강제
      score: Number(form.score),
      inning: Number(form.inning),
      result: form.result,
      gameType: form.gameType,
      gameDate: form.gameDate.toISOString(), // ISO로 통일
      memo: form.memo || "",
    });

    emitGamesChanged();
    closeEdit();
  };

  // ✅ delete => delete API
  const handleDelete = async () => {
    if (!editing) return;
    await deleteMyGameApi(editing.id);
    emitGamesChanged();
    closeEdit();
  };

  return (
    <>
      <GameList
        games={games}
        onEdit={openEdit}
        onDelete={(id) => {
          // 리스트에서 바로 삭제 눌러도 "edit 모달"로 들어가 삭제하게 할 수도 있고
          // 즉시 삭제(confirm)로 갈 수도 있음.
          // 우선: 해당 게임을 editing으로 잡고 모달에서 삭제 버튼 누르게
          const g = games.find((x) => x.id === id) || null;
          if (!g) return;
          setEditing(g);
          setEditOpen(true);
        }}
      />

      <GameUpsertModal
        opened={editOpen}
        onClose={closeEdit}
        mode="edit"
        initialGame={editing}
        showDelete
        onDelete={handleDelete}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
