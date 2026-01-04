import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  AppShell,
  Group,
  Title,
  Container,
  Badge,
  ActionIcon,
  Button,
  Modal,
  Stack,
  Text,
  TextInput,
  NumberInput,
} from "@mantine/core";
import { IconHome, IconArchive, IconChartBar, IconUser, IconPencil } from "@tabler/icons-react";
import { IconAnalyze } from "@tabler/icons-react";
import { useAuth } from "../features/auth/useAuth";

export default function AppShellLayout() {
  const { user, logout, updateMe } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editHandicap, setEditHandicap] = useState<number>(0);

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

  return (
    <AppShell padding="md" header={{ height: 60 }} footer={user ? { height: 60 } : undefined}>
      <AppShell.Header>
        <Container fluid px="sm" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Title order={4}>🎱 테크노 당구 기록</Title>

            {user ? (
              <Group gap="xs" wrap="nowrap">
                <Badge variant="light" radius="xl">
                  {user.nickname} · {user.handicap}점
                </Badge>

                <ActionIcon variant="light" radius="xl" size="lg" onClick={openProfile}>
                  <IconUser size={18} />
                </ActionIcon>

                <Button size="xs" variant="light" onClick={logout}>
                  로그아웃
                </Button>
              </Group>
            ) : null}
          </Group>
        </Container>
      </AppShell.Header>

      {user && (
        <AppShell.Footer>
          <Group h="100%" grow justify="center" gap={0}>
            <ActionIcon component={NavLink} to="/" variant="subtle" size="xl">
              <IconHome />
            </ActionIcon>
            <ActionIcon component={NavLink} to="/archive" variant="subtle" size="xl">
              <IconArchive />
            </ActionIcon>
            <ActionIcon component={NavLink} to="/insights" variant="subtle" size="xl">
              <IconAnalyze />
            </ActionIcon>
            <ActionIcon component={NavLink} to="/ranking" variant="subtle" size="xl">
              <IconChartBar />
            </ActionIcon>
          </Group>
        </AppShell.Footer>
      )}

      <AppShell.Main>
        <Container style={{ paddingBottom: "80px" }}>
          <Outlet />
        </Container>

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
      </AppShell.Main>
    </AppShell>
  );
}