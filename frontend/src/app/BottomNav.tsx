import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Group, ActionIcon, Text } from "@mantine/core";
import { IconHome, IconList, IconAnalyze, IconTrophy } from "@tabler/icons-react";

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

export default function BottomNav() {
  const location = useLocation();

  // 1) 탭 목록은 설정 배열로 관리(유지보수 쉬움)
  const items = useMemo<Item[]>(
    () => [
      { to: "/", label: "홈", icon: IconHome },
      { to: "/games", label: "기록", icon: IconList },
      { to: "/insights", label: "분석", icon: IconAnalyze },
      { to: "/ranking", label: "랭킹", icon: IconTrophy },
    ],
    []
  );

  // 2) active 판별: 현재 pathname이 해당 탭 경로로 시작하면 active
  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/" || location.pathname.startsWith("/home");
    return location.pathname.startsWith(to);
  };

  // 3) 버튼(아이콘 + 라벨) 컴포넌트화
  const NavBtn = ({ to, label, icon: Icon }: Item) => {
    const active = isActive(to);

    return (
      <div style={{ width: "100%", display: "grid", justifyItems: "center", gap: 4 }}>
        <ActionIcon
          component={NavLink}
          to={to}
          variant={active ? "light" : "subtle"}
          radius="xl"
          size={48}
          aria-label={label}
        >
          <Icon size={22} />
        </ActionIcon>
        <Text size="xs" fw={900} c={active ? undefined : "dimmed"}>
          {label}
        </Text>
      </div>
    );
  };

  return (
    <div
      style={{
        height: 72,
        borderTop: "1px solid var(--mantine-color-gray-3)",
        background: "var(--mantine-color-body)",
        padding: "8px 10px",
      }}
    >
      <Group h="100%" grow gap={0} wrap="nowrap">
        {items.map((it) => (
          <NavBtn key={it.to} {...it} />
        ))}
      </Group>
    </div>
  );
}