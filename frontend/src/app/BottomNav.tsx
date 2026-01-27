import React, { useMemo, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Group, ActionIcon, Text } from "@mantine/core";
import {
  IconHome,
  IconList,
  IconAnalyze,
  IconTrophy,
  IconPlus,
} from "@tabler/icons-react";

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

type Props = {
  onCreate: () => void; // ✅ 추가
};

export default function BottomNav({ onCreate }: Props) {
  const location = useLocation();
  const fabRef = useRef<HTMLButtonElement | null>(null);

  const items = useMemo<Item[]>(
    () => [
      { to: "/", label: "홈", icon: IconHome },
      { to: "/games", label: "기록", icon: IconList },
      { to: "/insights", label: "분석", icon: IconAnalyze },
      { to: "/ranking", label: "랭킹", icon: IconTrophy },
    ],
    []
  );

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/" || location.pathname.startsWith("/home");
    return location.pathname.startsWith(to);
  };

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

  const popFab = () => {
    const el = fabRef.current;
    if (!el) return;
    el.classList.remove("fabPop");
    void el.offsetWidth;
    el.classList.add("fabPop");
  };

  return (
    <div
      style={{
        height: 72,
        borderTop: "1px solid var(--mantine-color-gray-3)",
        background: "var(--mantine-color-body)",
        padding: "8px 10px",
        position: "relative", // ✅ FAB absolute 기준
      }}
    >
      {/* ✅ 5칸 그리드: [홈][기록][빈칸][분석][랭킹] */}
      <Group h="100%" grow gap={0} wrap="nowrap">
        <NavBtn {...items[0]} />
        <NavBtn {...items[1]} />

        {/* 가운데는 FAB 자리 확보 */}
        <div style={{ width: "100%", height: "100%" }} />

        <NavBtn {...items[2]} />
        <NavBtn {...items[3]} />
      </Group>

      {/* ✅ 가운데 + 버튼 (튀어나온 느낌) */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          width: 72, // 가운데 칸 느낌 유지
          height: 72,
          display: "grid",
          justifyItems: "center",
        }}
      >
        <ActionIcon
          ref={fabRef}
          className="fabBtn"
          radius="xl"
          variant="filled"
          size={56}
          aria-label="새 게임 추가"
          onClick={() => {
            popFab();
            onCreate();
          }}
          style={{
            marginTop: -18, // ✅ 위로 튀어나오게
            boxShadow: "0 10px 24px rgba(0,0,0,0.20)",
            border: "1px solid rgba(255,255,255,0.20)",
          }}
        >
          <IconPlus size={26} />
        </ActionIcon>

        <Text size="xs" fw={900} mt={2}>
          추가
        </Text>
      </div>
    </div>
  );
}