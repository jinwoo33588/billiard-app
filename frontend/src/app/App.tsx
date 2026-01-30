import React from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "../features/auth/RequireAuth";
import AppShellLayout from "./AppShellLayout";

import HomePage from "../pages/HomePage";
import GamesPage from "../pages/GamesPage";
import InsightsPage from "../pages/InsightsPage";
import RankingPage from "../pages/RankingPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import UserProfilePage from "../pages/UserProfilePage";
import AdminPage from "../pages/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ✅ 관리자 페이지는 인증 없이 접근 */}
      <Route path="/admin" element={<AdminPage />} />

      {/* 1) 인증 가드 */}
      <Route element={<RequireAuth />}>
        {/* 2) 앱 쉘 */}
        <Route element={<AppShellLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/games" element={<GamesPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/users/:id" element={<UserProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
