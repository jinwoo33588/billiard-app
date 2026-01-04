import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShellLayout from "./app/AppShellLayout";
import { ProtectedRoute } from "./app/ProtectedRoute";
import { useAuth } from "./features/auth/useAuth";

import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ArchivePage from "./pages/ArchivePage";
import RankingPage from "./pages/RankingPage";
import UserProfilePage from "./pages/UserProfilePage";
import InsightsPage from "./pages/InsightsPage";


import { Center, Loader } from "@mantine/core";

export default function App() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
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