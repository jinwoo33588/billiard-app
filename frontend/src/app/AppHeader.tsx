import React from "react";
import { Container, Group, Title, Badge, ActionIcon, Menu, Text } from "@mantine/core";
import { IconUser, IconLogout, IconPencil, IconPlus } from "@tabler/icons-react";

type UserLike = {
  nickname?: string | null;
  handicap?: number | null;
};

export default function AppHeader({
  user,
  onOpenProfile,
  onLogout,
 
}: {
  user: UserLike | null;
  onOpenProfile: () => void;
  onLogout: () => void;

}) {
  return (
    <Container fluid px="sm" h="100%">
      <Group h="100%" justify="space-between" wrap="nowrap">
        <Title order={4}>🎱 테크노 당구 기록</Title>

        {user ? (
          <Group gap="xs" wrap="nowrap">
          

            <Badge variant="light" radius="xl">
              {user.nickname} · {user.handicap}점
            </Badge>

            {/* ✅ IconUser 누르면 메뉴 펼치기 */}
            <Menu width={200} position="bottom-end" withArrow shadow="md">
              <Menu.Target>
                <ActionIcon variant="light" radius="xl" size="lg" aria-label="계정 메뉴">
                  <IconUser size={18} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>계정</Menu.Label>
                <Menu.Item leftSection={<IconPencil size={16} />} onClick={onOpenProfile}>
                  프로필 편집
                </Menu.Item>

                <Menu.Divider />

                <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={onLogout}>
                  로그아웃
                </Menu.Item>

                <Menu.Divider />
                <Text size="xs" c="dimmed" px="sm" pb="xs">
                  {user.nickname ?? "user"} / 핸디 {user.handicap ?? 0}
                </Text>
              </Menu.Dropdown>
            </Menu>
          </Group>
        ) : null}
      </Group>
    </Container>
  );
}