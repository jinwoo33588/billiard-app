import { useEffect, useState } from "react";
import {
  Modal,
  Box,
  TextInput,
  NumberInput,
  Button,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { updateMeApi } from "../auth.api";
import { useAuth } from "../useAuth";
import type { UserPublic } from "../types";

type Props = {
  opened: boolean;
  onClose: () => void;
};

function toErrorMessage(e: any) {
  return (
    e?.response?.data?.message ||
    e?.message ||
    "저장 중 오류가 발생했습니다."
  );
}

export default function ProfileEditModal({ opened, onClose }: Props) {
  const { user, refreshMe } = useAuth();

  const [nickname, setNickname] = useState("");
  const [handicap, setHandicap] = useState<number | string>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달 열릴 때 현재 값으로 초기화
  useEffect(() => {
    if (!opened || !user) return;
    setNickname(user.nickname ?? "");
    setHandicap(user.handicap ?? 0);
    setSaving(false);
    setError(null);
  }, [opened, user]);

  const nicknameError =
    nickname.trim().length === 0 ? "닉네임을 입력해주세요." : undefined;

  const handicapVal = Number(handicap);
  const handicapError =
    !Number.isFinite(handicapVal) || handicapVal < 0 || handicapVal > 200
      ? "핸디캡은 0~200 사이 숫자여야 합니다."
      : undefined;

  const canSubmit = !nicknameError && !handicapError && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSaving(true);
      setError(null);
      await updateMeApi({ nickname: nickname.trim(), handicap: handicapVal });
      await refreshMe();
      onClose();
    } catch (e: any) {
      setError(toErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => { if (!saving) onClose(); }}
      title={<Text fw={900}>프로필 편집</Text>}
      centered
    >
      <Box>
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            mb="sm"
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.currentTarget.value)}
          error={nicknameError}
          disabled={saving}
          mb="sm"
        />

        <NumberInput
          label="핸디캡"
          value={handicap}
          onChange={(v) => setHandicap(v)}
          min={0}
          max={200}
          step={1}
          allowDecimal={false}
          error={handicapError}
          disabled={saving}
          mb="xl"
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={saving}>
            취소
          </Button>
          <Button onClick={handleSubmit} loading={saving} disabled={!canSubmit}>
            저장
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}
