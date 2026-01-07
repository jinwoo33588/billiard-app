import React, { useMemo, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Container, Group, ActionIcon } from "@mantine/core";
import { IconHome, IconArchive, IconChartBar, IconPlus } from "@tabler/icons-react";
import { IconAnalyze } from "@tabler/icons-react";

export default function BottomNav({ onCreateGame }: { onCreateGame: () => void }) {
  const location = useLocation();

  const items = useMemo(
    () => [
      { to: "/", label: "홈", icon: IconHome },
      { to: "/archive", label: "기록", icon: IconArchive },
      // 가운데는 FAB 자리
      { to: "/insights", label: "분석", icon: IconAnalyze },
      { to: "/ranking", label: "랭킹", icon: IconChartBar },
    ],
    []
  );

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/" || location.pathname.startsWith("/home");
    return location.pathname.startsWith(to);
  };

  const fabRef = useRef<HTMLButtonElement | null>(null);

  const popFab = () => {
    const el = fabRef.current;
    if (!el) return;
    console.log("pop");
    el.classList.remove("fabPop");
    // reflow로 애니메이션 재시작
    void el.offsetWidth;
    el.classList.add("fabPop");
  };


  const NavBtn = ({ to, label, icon: Icon }: any) => {
    const active = isActive(to);
    return (
      <ActionIcon
        
        component={NavLink}
        to={to}
        variant={active ? "light" : "subtle"}
        radius="xl"
        size="xl"
        style={{ height: 48, width: "100%" }}
        aria-label={label}
      >
        <Icon size={22} />
      </ActionIcon>
    );
  };

  return (
    <Container fluid px="xs" h="100%" style={{ position: "relative" }}>
      {/* ✅ 5칸 그리드: [홈][기록][FAB][분석][랭킹] */}
      <Group h="100%" grow justify="center" gap={0} wrap="nowrap" style={{ position: "relative" }}>
        <NavBtn {...items[0]} />
        <NavBtn {...items[1]} />

        {/* 가운데 칸은 공간만 확보(버튼은 위에 떠있음) */}
        <div style={{ width: "100%", height: 48 }} />

        <NavBtn {...items[2]} />
        <NavBtn {...items[3]} />
      </Group>

      {/* ✅ 떠있는 FAB */}
      <ActionIcon
      ref={fabRef}
      className="fabBtn"
      onAnimationEnd={() => {
        fabRef.current?.classList.remove("fabPop");
      }}
      onClick={() => {
        popFab();
        onCreateGame();
      }}
       
        radius="xl"
        variant="filled"
        size={56}
        aria-label="새 경기 기록"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 18, // footer(64px) 위로 살짝
          boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <IconPlus size={26} />
      </ActionIcon>
    </Container>
  );
}