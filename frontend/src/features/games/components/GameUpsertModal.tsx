// frontend/src/features/games/components/GameUpsertModal.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Box,
  Grid,
  Group,
  Button,
  Text,
  TextInput,
  Textarea,
  Select,
  Badge,
  Alert,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import DateFieldFlatpickr from "../../../shared/components/DateFieldFlatpickr";
import { useAuth } from "../../auth/useAuth";
import type { Game } from "../types";

type Mode = "create" | "edit";

export type GameUpsertForm = {
  gameDate: Date;
  gameType: Game["gameType"];
  result: Game["result"];
  score: number | "";
  inning: number | "";
  memo: string;
};

type Props = {
  opened: boolean;
  onClose: () => void;

  mode: Mode;
  initialGame?: Game | null;

  // ✅ Promise 허용
  onSubmit?: (form: GameUpsertForm) => Promise<void> | void;

  showDelete?: boolean;
  onDelete?: () => Promise<void> | void;
};

const GAME_TYPE_OPTIONS: { label: string; value: Game["gameType"] }[] = [
  { label: "1:1", value: "1v1" },
  { label: "2:2", value: "2v2" },
  { label: "2:2:2", value: "2v2v2" },
  { label: "3:3", value: "3v3" },
  { label: "3:3:3", value: "3v3v3" },
  { label: "기타", value: "UNKNOWN" },
];

function defaultForm(): GameUpsertForm {
  return {
    gameDate: new Date(),
    gameType: "2v2v2",
    result: "UNKNOWN",
    score: "",
    inning: "",
    memo: "",
  };
}

function formFromGame(g: Game): GameUpsertForm {
  const rawDate = g.gameDate ? new Date(g.gameDate) : new Date();
  const safeDate = Number.isNaN(rawDate.getTime()) ? new Date() : rawDate;
  return {
    gameDate: safeDate,
    gameType: (g.gameType ?? "UNKNOWN") as Game["gameType"],
    result: (g.result ?? "UNKNOWN") as Game["result"],
    score: typeof g.score === "number" ? g.score : "",
    inning: typeof g.inning === "number" ? g.inning : "",
    memo: g.memo ?? "",
  };
}

function toErrorMessage(e: any) {
  return (
    e?.response?.data?.message ||
    e?.message ||
    "요청 처리 중 오류가 발생했습니다."
  );
}

export default function GameUpsertModal({
  opened,
  onClose,
  mode,
  initialGame = null,
  onSubmit,
  showDelete = false,
  onDelete,
}: Props) {
  const { isGuest } = useAuth();
  const title = mode === "create" ? "새 경기 기록" : "경기 기록 수정";

  const [form, setForm] = useState<GameUpsertForm>(() => defaultForm());
  const [touched, setTouched] = useState(false);

  // ✅ 추가: 저장/에러 상태
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) return;
    if (mode === "edit" && initialGame) setForm(formFromGame(initialGame));
    else setForm(defaultForm());

    setTouched(false);
    setSaving(false);
    setSubmitError(null);
  }, [opened, mode, initialGame]);

  const avgPreview = useMemo(() => {
    const s = Number(form.score);
    const i = Number(form.inning);
    if (!Number.isFinite(s) || !Number.isFinite(i) || i <= 0) return null;
    return (s / i).toFixed(3);
  }, [form.score, form.inning]);

  const gameDateValue = useMemo(() => {
    const d = form.gameDate;
    if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }, [form.gameDate]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (
      form.score === "" ||
      !Number.isFinite(Number(form.score)) ||
      Number(form.score) < 0
    )
      e.score = "점수를 입력하세요.";
    if (
      form.inning === "" ||
      !Number.isFinite(Number(form.inning)) ||
      Number(form.inning) < 1
    )
      e.inning = "이닝을 입력하세요.";
    if (
      !(form.gameDate instanceof Date) ||
      Number.isNaN(form.gameDate.getTime())
    )
      e.gameDate = "날짜를 선택하세요.";
    if (form.memo.length > 500) e.memo = "메모는 500자 이내로 작성해주세요.";
    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0;

  const setNumericField = (key: "score" | "inning", raw: string) => {
    const onlyDigits = raw.replace(/\D/g, "");
    setForm((s) => ({
      ...s,
      [key]: onlyDigits === "" ? "" : Number(onlyDigits),
    }));
  };

  const submit = async () => {
    setTouched(true);
    setSubmitError(null);
    if (!canSubmit || saving) return;

    try {
      setSaving(true);
      await onSubmit?.(form);
      // ✅ 성공 후 닫기는 "부모에서" 처리하는 방식 유지
      // (부모에서 이미 close 하게 짤 예정)
      setSaving(false);
    } catch (e: any) {
      setSubmitError(toErrorMessage(e));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || saving) return;

    try {
      setSaving(true);
      setSubmitError(null);
      await onDelete();
      setSaving(false);
    } catch (e: any) {
      setSubmitError(toErrorMessage(e));
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (!saving) onClose();
      }}
      title={<Text fw={900}>{title}</Text>}
      centered
    >
      <Box>
        {submitError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            mb="sm"
          >
            {submitError}
          </Alert>
        )}

        {isGuest && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="yellow"
            variant="light"
            mb="sm"
          >
            게스트 모드에서는 데이터를 수정할 수 없습니다.
          </Alert>
        )}

        <Grid>
          <Grid.Col span={12}>
            <DateFieldFlatpickr
              value={gameDateValue}
              onChange={(v) => {
                const next = new Date(v);
                if (Number.isNaN(next.getTime())) return;
                setForm((s) => ({ ...s, gameDate: next }));
              }}
              error={touched ? errors.gameDate : undefined}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="이닝 수"
              placeholder="예: 20"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.inning === "" ? "" : String(form.inning)}
              onChange={(e) => setNumericField("inning", e.currentTarget.value)}
              error={touched ? errors.inning : undefined}
              disabled={saving || isGuest}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="내 점수"
              placeholder="예: 18"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.score === "" ? "" : String(form.score)}
              onChange={(e) => setNumericField("score", e.currentTarget.value)}
              error={touched ? errors.score : undefined}
              disabled={saving || isGuest}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Group justify="space-between" align="center">
              <Text size="sm" fw={600}>
                에버리지 미리보기
              </Text>
              <Badge variant="light" radius="xl">
                {avgPreview ? `Avg: ${avgPreview}` : "점수/이닝 입력 시 표시"}
              </Badge>
            </Group>
          </Grid.Col>

          <Grid.Col span={6}>
            <Text size="sm" fw={500} mb={6}>
              결과
            </Text>

            <Group grow gap="xs">
              <Button
                radius="xl"
                color="blue"
                variant={form.result === "WIN" ? "filled" : "light"}
                onClick={() => setForm((s) => ({ ...s, result: "WIN" }))}
                type="button"
                disabled={saving || isGuest}
              >
                승
              </Button>

              <Button
                radius="xl"
                color="gray"
                variant={form.result === "DRAW" ? "filled" : "light"}
                onClick={() => setForm((s) => ({ ...s, result: "DRAW" }))}
                type="button"
                disabled={saving || isGuest}
              >
                무
              </Button>

              <Button
                radius="xl"
                color="red"
                variant={form.result === "LOSE" ? "filled" : "light"}
                onClick={() => setForm((s) => ({ ...s, result: "LOSE" }))}
                type="button"
                disabled={saving || isGuest}
              >
                패
              </Button>
            </Group>
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              label="방식"
              required
              data={GAME_TYPE_OPTIONS}
              value={form.gameType}
              onChange={(v) =>
                setForm((s) => ({
                  ...s,
                  gameType: (v as Game["gameType"]) ?? "UNKNOWN",
                }))
              }
              disabled={saving || isGuest}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea
              label="메모"
              value={form.memo}
              onChange={(e) =>
                setForm((s) => ({ ...s, memo: e.currentTarget.value }))
              }
              error={touched ? errors.memo : undefined}
              autosize
              minRows={3}
              description={`${form.memo.length}/500`}
              disabled={saving || isGuest}
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
          {mode === "edit" && showDelete ? (
            <Button
              color="red"
              variant="light"
              onClick={handleDelete}
              type="button"
              disabled={saving || isGuest}
              loading={saving}
            >
              삭제
            </Button>
          ) : null}

          <Button
            variant="default"
            onClick={onClose}
            type="button"
            disabled={saving}
          >
            취소
          </Button>

          <Button
            onClick={submit}
            disabled={!canSubmit || saving || isGuest}
            type="button"
            loading={saving}
          >
            {mode === "create" ? "저장" : "수정"}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
