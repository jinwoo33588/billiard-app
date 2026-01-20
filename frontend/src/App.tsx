import { AppShell, Container } from "@mantine/core";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";

function BottomNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const items = useMemo(
    () => [
      { key: "home", label: "홈", path: "/" },
      { key: "games", label: "기록", path: "/games" },
      { key: "rank", label: "랭킹", path: "/ranking" },
      { key: "me", label: "내정보", path: "/me" },
    ],
    []
  );

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        borderTop: "1px solid #eee",
        background: "white",
        padding: "10px 12px",
        display: "flex",
        gap: 8,
        justifyContent: "space-between",
        zIndex: 1000,
      }}
    >
      {items.map((it) => {
        const active = pathname === it.path;
        return (
          <button
            key={it.key}
            onClick={() => nav(it.path)}
            style={{
              flex: 1,
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: "10px 8px",
              background: active ? "#111" : "white",
              color: active ? "white" : "#111",
              fontWeight: 700,
            }}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function Page({ title }: { title: string }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <Container size="sm" style={{ paddingTop: 14, paddingBottom: 84 }}>
      <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 12 }}>{title}</div>
      <div style={{ color: "#666" }}>여기부터 기능을 붙이면 됩니다.</div>
    </Container>
  );
}

export default function App() {
  return (
    <AppShell padding={0}>
      <Routes>
        <Route path="/" element={<Page title="홈" />} />
        <Route path="/games" element={<Page title="내 게임" />} />
        <Route path="/ranking" element={<Page title="랭킹" />} />
        <Route path="/me" element={<Page title="내 정보" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <BottomNav />
    </AppShell>
  );
}