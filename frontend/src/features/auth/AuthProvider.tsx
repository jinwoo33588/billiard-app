import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getMeApi, loginApi, registerApi } from "./auth.api";
import type { AuthContextValue, RegisterPayload, UserPublic } from "./types";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  // 역할: 앱 시작 시 "토큰이 있으면 내 정보 불러오기"에 사용
  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    const me = await getMeApi();
    setUser(me);
  }, []);

  // 역할: 최초 마운트 시 1회 실행 → 로그인 유지(자동 세션 복원)
  useEffect(() => {
    (async () => {
      try {
        const rawBase = String(import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
        const healthUrl = rawBase
          ? rawBase.endsWith("/api")
            ? `${rawBase}/health`
            : `${rawBase}/api/health`
          : "/api/health";
        void fetch(healthUrl).catch(() => {});
        await refreshMe();
      } catch {
        // 토큰이 만료/위조/서버에서 거부되면 정리
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  // 역할: 로그인 실행 → 토큰 저장 + user 상태 반영
  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await loginApi({ email, password });
    localStorage.setItem("token", token);
    setUser(user);
  }, []);

  // 역할: 회원가입 실행 → 토큰 저장 + user 상태 반영
  const register = useCallback(async (payload: RegisterPayload) => {
    const { token, user } = await registerApi(payload);
    localStorage.setItem("token", token);
    setUser(user);
  }, []);

  // 역할: 로그아웃(클라이언트 관점) → 토큰 삭제 + user null
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  // 역할: Context value를 메모이제이션 → 불필요한 리렌더 줄임
  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, refreshMe }),
    [user, loading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
