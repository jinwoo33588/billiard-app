import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  Group,
  Title,
  ActionIcon,
  Modal,
  Stack,
  Text,
  TextInput,
  NumberInput,
  Button,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconUser, IconPencil } from '@tabler/icons-react';

export type User = {
  _id: string;
  nickname: string;
  email: string;
  handicap: number;
};

export default function AppHeader({
  user,
  onUserUpdated,
  title = '테크노당구',
}: {
  user: User | null;
  onUserUpdated?: (next: User) => void;
  title?: string;
}) {
  const [opened, { open, close }] = useDisclosure(false);

  const [nickname, setNickname] = useState('');
  const [handicap, setHandicap] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    setNickname(user.nickname ?? '');
    setHandicap(Number(user.handicap ?? 0));
  }, [user, opened]);

  const saveProfile = async () => {
    try {
      const payload = {
        nickname: nickname.trim(),
        handicap: Number(handicap) || 0,
      };

      const res = await axiosInstance.put('/users/me', payload);
      // 백엔드가 수정된 user를 반환하도록 해뒀다면 그대로 사용
      const nextUser = res.data as User;

      onUserUpdated?.(nextUser);
      close();
    } catch (e) {
      console.error(e);
      alert('프로필 수정에 실패했습니다.');
    }
  };

  return (
    <>
      <Group justify="space-between" align="center" px="sm" py="sm">
        <Title order={3} style={{ lineHeight: 1 }}>
          {title}
        </Title>

        {user ? (
          <Group gap="xs" wrap="nowrap">
            <Badge variant="light" radius="xl">
              {user.nickname} · {user.handicap}점
            </Badge>

            <ActionIcon variant="light" radius="xl" size="lg" onClick={open}>
              <IconUser size={18} />
            </ActionIcon>
          </Group>
        ) : (
          <ActionIcon variant="light" radius="xl" size="lg" disabled>
            <IconUser size={18} />
          </ActionIcon>
        )}
      </Group>

      <Modal opened={opened} onClose={close} title="프로필 수정" centered>
        <Stack>
          <Text size="sm" c="dimmed">
            닉네임과 핸디캡(내 점수)을 수정할 수 있어요.
          </Text>

          <TextInput
            label="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.currentTarget.value)}
            placeholder="예: jinwoo"
            rightSection={<IconPencil size={16} />}
          />

          <NumberInput
            label="핸디캡(점수)"
            value={handicap}
            onChange={(v) => setHandicap(Number(v) || 0)}
            min={0}
            clampBehavior="strict"
            placeholder="예: 25"
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={close}>
              취소
            </Button>
            <Button onClick={saveProfile} disabled={!nickname.trim()}>
              저장
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}