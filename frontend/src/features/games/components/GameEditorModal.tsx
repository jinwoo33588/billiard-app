// frontend/src/features/games/components/GameEditorModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Button,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Alert,
} from "@mantine/core";
import type { Game } from "../types";
import { createMyGameApi, updateMyGameApi } from "../api";

type Mode = "create" | "edit";

type Props = {
  opened: boolean;
  mode: Mode;
  onClose: () => void;

  // edit일 때 단건 조회 결과를 넣어줌
  initialGame?: Game | null;

  // 성공 후 부모가 refetch/close 등을 처리
  onSuccess?: (saved: Game) => void;
};

const GAME_RESULTS = ["WIN", "DRAW", "LOSE", "UNKNOWN"] as const;
const GAME_TYPES = ["UNKNOWN", "1v1", "2v2", "2v2v2", "3v3", "3v3v3"] as const;

function toDateOnly(value?: string | Date | null) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function GameEditorModal({
  opened,
  mode,
  onClose,
  initialGame = null,
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const title = useMemo(() => (isEdit ? "게임 수정" : "게임 추가"), [isEdit]);

  const [score, setScore] = useState<number | undefined>(undefined);
  const [inning, setInning] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<(typeof GAME_RESULTS)[number]>("UNKNOWN");
  const [gameType, setGameType] = useState<(typeof GAME_TYPES)[number]>("UNKNOWN");
  const [gameDate, setGameDate] = useState<string>("");
  const [memo, setMemo] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // opened/initialGame 변경 시 폼 동기화
  useEffect(() => {
    if (!opened) return;

    setError(null);

    if (isEdit) {
      // edit: initialGame으로 채우기
      setScore(initialGame ? Number(initialGame.score) : undefined);
      setInning(initialGame ? Number(initialGame.inning) : undefined);
      setResult((initialGame?.result as any) ?? "UNKNOWN");
      setGameType((initialGame?.gameType as any) ?? "UNKNOWN");
      setGameDate(toDateOnly(initialGame?.gameDate ?? null));
      setMemo(initialGame?.memo ?? "");
    } else {
      // create: 초기화
      setScore(undefined);
      setInning(undefined);
      setResult("UNKNOWN");
      setGameType("UNKNOWN");
      setGameDate(toDateOnly(new Date()));
      setMemo("");
    }
  }, [opened, isEdit, initialGame?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    try {
      setError(null);

      const s = Number(score);
      const inn = Number(inning);

      if (!Number.isFinite(s) || s < 0) {
        setError("점수(score)는 0 이상의 숫자여야 합니다.");
        return;
      }
      if (!Number.isFinite(inn) || inn < 1) {
        setError("이닝(inning)은 1 이상의 숫자여야 합니다.");
        return;
      }
      if (!gameDate) {
        setError("날짜(gameDate)는 필수입니다.");
        return;
      }

      setSaving(true);

      const payload: Partial<Game> = {
        score: s,
        inning: inn,
        result,
        gameType,
        gameDate, // "YYYY-MM-DD" (백엔드 parseRequiredDate가 처리)
        memo: memo?.trim() ?? "",
      };

      let saved: Game;

      if (isEdit) {
        const id = initialGame?._id;
        if (!id) {
          setError("수정할 게임 ID가 없습니다. (initialGame 누락)");
          return;
        }
        saved = await updateMyGameApi(id, payload);
      } else {
        saved = await createMyGameApi(payload);
      }

      onSuccess?.(saved);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Stack gap="sm">
        {error && <Alert color="red">{error}</Alert>}

        <Group grow>
          <NumberInput
            label="점수"
            value={score}
            onChange={(v) => setScore(typeof v === "number" ? v : undefined)}
            min={0}
            step={1}
          />
          <NumberInput
            label="이닝"
            value={inning}
            onChange={(v) => setInning(typeof v === "number" ? v : undefined)}
            min={1}
            step={1}
          />
        </Group>

        <Group grow>
          <Select
            label="결과"
            value={result}
            onChange={(v) => setResult((v as any) ?? "UNKNOWN")}
            data={GAME_RESULTS.map((v) => ({ value: v, label: v }))}
          />
          <Select
            label="타입"
            value={gameType}
            onChange={(v) => setGameType((v as any) ?? "UNKNOWN")}
            data={GAME_TYPES.map((v) => ({ value: v, label: v }))}
          />
        </Group>

        <TextInput
          label="날짜"
          type="date"
          value={gameDate}
          onChange={(e) => setGameDate(e.currentTarget.value)}
        />

        <Textarea
          label="메모"
          value={memo}
          onChange={(e) => setMemo(e.currentTarget.value)}
          minRows={3}
          autosize
        />

        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "수정 저장" : "추가"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
