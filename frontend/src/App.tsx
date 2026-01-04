import React from "react";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShellLayout from "./app/AppShellLayout";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { useAuth } from "./features/auth/useAuth";
import { warmupBackend } from "./app/warmup";


import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ArchivePage from "./pages/ArchivePage";
import RankingPage from "./pages/RankingPage";
import UserProfilePage from "./pages/UserProfilePage";
import InsightsPage from "./pages/InsightsPage";


import { Center, Loader } from "@mantine/core";

export default function App() {
  const { loading, user } = useAuth();

  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await warmupBackend();
        setBooting(false);
      } catch (e) {
        setBootError("서버를 깨우는 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
        setBooting(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  // ✅ 모바일에서 “흰 화면” 안 보이게: 풀스크린 로딩
  if (booting) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        textAlign: "center",
      }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
          서버 준비 중…
        </div>
        <div style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.4 }}>
          오랜만에 접속하면 서버가 깨어나는 데<br />최대 수십 초 걸릴 수 있어요.
        </div>
      </div>
    );
  }

  if (bootError) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 16,
      }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
          접속 오류
        </div>
        <div style={{ opacity: 0.7, fontSize: 14, marginBottom: 12 }}>
          {bootError}
        </div>
        <button
          style={{
            height: 44, // 모바일 터치 타겟
            borderRadius: 12,
            border: "1px solid #ddd",
            fontWeight: 700,
          }}
          onClick={() => window.location.reload()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<AppShellLayout />}>
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/archive"
          element={
            <ProtectedRoute>
              <ArchivePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <InsightsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ranking"
          element={
            <ProtectedRoute>
              <RankingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:userId"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={user ? "/" : "/auth"} replace />} />
      </Route>
    </Routes>
  );
}