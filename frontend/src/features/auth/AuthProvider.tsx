import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "./types";
import { getMeApi, loginApi, registerApi, updateMeApi } from "./api";

type RegisterPayload = {
  email: string;
  password: string;
  nickname: string;
  handicap: number;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;

  refreshMe: () => Promise<void>;
  updateMe: (payload: Partial<Pick<User, "nickname" | "handicap">>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    const me = await getMeApi();
    setUser(me);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginApi(email, password);
    localStorage.setItem("token", data.token);
    setUser(data.user); // UX 빠르게
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerApi(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const updateMe = useCallback(async (payload: Partial<Pick<User, "nickname" | "handicap">>) => {
    const updated = await updateMeApi(payload);
    setUser(updated);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refreshMe();
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshMe]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshMe, updateMe }),
    [user, loading, login, register, logout, refreshMe, updateMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}