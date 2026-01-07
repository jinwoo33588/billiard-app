import React, { useEffect, useMemo } from "react";
import { useForm } from "@mantine/form";
import {
  Modal,
  Box,
  Grid,
  Select,
  Textarea,
  Group,
  Button,
  Text,
  TextInput,
  Badge,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import type { Game } from "../types";

export type GameUpsertValues = {
  score: number | "";
  inning: number | "";
  result: Game["result"] | "";   // ✅ 결과 없음 허용
  gameType: Game["gameType"];
  gameDate: Date | null;
  memo: string;
};

type Props = {
  opened: boolean;
  mode: "create" | "edit";
  initial?: Partial<Game>;
  title?: string;

  onClose: () => void;
  onSubmit: (values: GameUpsertValues) => Promise<void> | void;
};

export default function GameUpsertModal({
  opened,
  mode,
  initial,
  title,
  onClose,
  onSubmit,
}: Props) {
  const form = useForm<GameUpsertValues>({
    initialValues: {
      score: "",
      inning: "",
      result: "UNKNOWN",
      gameType: "2v2v2",
      gameDate: new Date(),
      memo: "",
    },
    validate: {
      gameDate: (value) => (value ? null : "날짜를 선택하세요."),
      score: (value) => (value === "" ? "점수를 입력하세요." : null),
      inning: (value) => (value === "" ? "이닝을 입력하세요." : null),
    },
  });

  // ✅ Avg 미리보기
  const avgPreview = useMemo(() => {
    const s = Number(form.values.score);
    const i = Number(form.values.inning);
    if (!Number.isFinite(s) || !Number.isFinite(i) || i <= 0) return null;
    return (s / i).toFixed(3);
  }, [form.values.score, form.values.inning]);

  // ✅ opened + initial 바뀔 때마다 세팅
  useEffect(() => {
    if (!opened) return;

    if (mode === "edit" && initial?._id) {
      form.setValues({
        score: (initial as any).score ?? "",
        inning: (initial as any).inning ?? "",
        result: ((initial as any).result ?? "") as any,
        gameType: ((initial as any).gameType ?? "2v2v2") as any,
        gameDate: initial.gameDate ? new Date(initial.gameDate) : new Date(),
        memo: initial.memo ?? "",
      });
    } else {
      // ✅ create 기본값(오늘/2v2v2/결과없음)
      form.setValues({
        score: "",
        inning: "",
        result: "UNKNOWN",
        gameType: "2v2v2",
        gameDate: new Date(),
        memo: "",
      });
      form.resetDirty();
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, mode, initial?._id]);

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const handleSubmit = async (values: GameUpsertValues) => {
    await onSubmit(values);
    handleClose();
  };

  const modalTitle = title ?? (mode === "create" ? "새 경기 기록" : "경기 기록 수정");

  // ✅ 숫자만 남기고 number|""로 세팅
  const setNumericField = (key: "inning" | "score", raw: string) => {
    const onlyDigits = raw.replace(/\D/g, "");
    form.setFieldValue(key, onlyDigits === "" ? "" : Number(onlyDigits));
  };

  return (
    <Modal opened={opened} onClose={handleClose} title={modalTitle} centered>
      <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={12}>
            <DatePickerInput label="경기 날짜" required {...form.getInputProps("gameDate")} />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="이닝 수"
              placeholder="예: 20"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.values.inning === "" ? "" : String(form.values.inning)}
              onChange={(e) => setNumericField("inning", e.currentTarget.value)}
              error={form.errors.inning}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <TextInput
              label="내 점수"
              placeholder="예: 18"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.values.score === "" ? "" : String(form.values.score)}
              onChange={(e) => setNumericField("score", e.currentTarget.value)}
              error={form.errors.score}
            />
          </Grid.Col>

          {/* ✅ Avg 미리보기 */}
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

          {/* ✅ 결과: 3버튼 (크기는 기존 영역처럼 span 6) */}
          <Grid.Col span={6}>
            <Text size="sm" fw={500} mb={6}>
              결과
            </Text>

            <Group grow gap="xs">
              <Button
                radius="xl"
                color="blue"
                variant={form.values.result === "WIN" ? "filled" : "light"}
                onClick={() => form.setFieldValue("result", "WIN")}
                type="button"
              >
                승
              </Button>

              <Button
                radius="xl"
                color="gray"
                variant={form.values.result === "DRAW" ? "filled" : "light"}
                onClick={() => form.setFieldValue("result", "DRAW")}
                type="button"
              >
                무
              </Button>

              <Button
                radius="xl"
                color="red"
                variant={form.values.result === "LOSE" ? "filled" : "light"}
                onClick={() => form.setFieldValue("result", "LOSE")}
                type="button"
              >
                패
              </Button>
            </Group>
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              label="방식"
              required
              data={["1v1", "2v2", "2v2v2", "3v3", "3v3v3"]}
              {...form.getInputProps("gameType")}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <Textarea label="메모" {...form.getInputProps("memo")} />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={handleClose} type="button">
            취소
          </Button>
          <Button type="submit">{mode === "create" ? "저장" : "수정"}</Button>
        </Group>
      </Box>
    </Modal>
  );
}