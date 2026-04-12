import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { listAdminUsersApi } from "../features/admin/admin.api";

type GuestUserItem = {
  id: string;
  nickname: string;
  handicap: number;
};

export default function LoginPage() {
  const nav = useNavigate();
  const { login, guestLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guestUserId, setGuestUserId] = useState("");
  const [err, setErr] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"login" | "guest">("login");
  const [guestUsers, setGuestUsers] = useState<GuestUserItem[]>([]);
  const [loadingGuestUsers, setLoadingGuestUsers] = useState(false);
  const [guestUsersError, setGuestUsersError] = useState<string>("");
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== "guest" || guestUsers.length > 0) return;

    setLoadingGuestUsers(true);
    setGuestUsersError("");

    listAdminUsersApi()
      .then((users) => {
        setGuestUsers(
          (users as GuestUserItem[]).map((user) => ({
            id: user.id,
            nickname: user.nickname,
            handicap: user.handicap,
          })),
        );
      })
      .catch((e: any) => {
        setGuestUsersError(
          e?.response?.data?.message ??
            e?.message ??
            "사용자 목록을 불러오는 중 오류가 발생했습니다.",
        );
      })
      .finally(() => setLoadingGuestUsers(false));
  }, [activeTab, guestUsers.length]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");

    try {
      await login(email, password);
      nav("/");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Login failed";
      setErr(msg);
    }
  }

  async function onGuestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");

    try {
      setGuestLoading(true);
      await guestLogin(guestUserId);
      nav("/");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Guest login failed";
      setErr(msg);
    } finally {
      setGuestLoading(false);
    }
  }

  async function handleGuestClick(userId: string) {
    setErr("");
    setGuestLoading(true);

    try {
      await guestLogin(userId);
      nav("/");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Guest login failed";
      setErr(msg);
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "12px 0 8px" }}>로그인</h2>
      <p style={{ marginTop: 0, color: "#666" }}>
        계정으로 로그인하거나, 아래에서 바로 게스트 체험을 시작해보세요.
      </p>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 16,
          marginBottom: 16,
          borderBottom: "1px solid #ddd",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            setErr("");
          }}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: activeTab === "login" ? "#007bff" : "transparent",
            color: activeTab === "login" ? "white" : "#666",
            border: "none",
            borderBottom: activeTab === "login" ? "2px solid #007bff" : "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          일반 로그인
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("guest");
            setErr("");
          }}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: activeTab === "guest" ? "#007bff" : "transparent",
            color: activeTab === "guest" ? "white" : "#666",
            border: "none",
            borderBottom: activeTab === "guest" ? "2px solid #007bff" : "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          게스트 체험
        </button>
      </div>

      {err && (
        <div
          style={{
            background: "#ffecec",
            padding: 12,
            borderRadius: 10,
            marginTop: 12,
          }}
        >
          {err}
        </div>
      )}

      {activeTab === "login" && (
        <form
          onSubmit={onSubmit}
          style={{ display: "grid", gap: 12, marginTop: 12 }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14 }}>이메일</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="a@a.com"
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
              autoComplete="email"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 14 }}>비밀번호</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••"
              type="password"
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ddd",
              fontWeight: 700,
            }}
          >
            로그인
          </button>
        </form>
      )}

      {activeTab === "guest" && (
        <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
          <div style={{ color: "#666", fontSize: 13 }}>
            <p style={{ margin: 0 }}>
              사용자 목록을 클릭하면 해당 사용자로 게스트 로그인이 됩니다.
            </p>
            <p style={{ margin: 0 }}>(기록 추가/수정/삭제는 불가능합니다)</p>
          </div>

          {loadingGuestUsers ? (
            <div
              style={{ padding: 12, background: "#f5f5f5", borderRadius: 10 }}
            >
              사용자 목록을 불러오는 중...
            </div>
          ) : guestUsersError ? (
            <div
              style={{
                padding: 12,
                background: "#ffecec",
                borderRadius: 10,
                color: "#a00",
              }}
            >
              {guestUsersError}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {guestUsers.slice(0, 12).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleGuestClick(user.id)}
                  disabled={guestLoading}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 12,
                    border: "1px solid #ddd",
                    background: "white",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>
                    <strong>{user.nickname}</strong> · 핸디 {user.handicap}
                  </span>
                  <span style={{ color: "#666", fontSize: 12 }}>
                    게스트로 보기
                  </span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onGuestSubmit} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 14 }}>사용자 ID</span>
              <input
                value={guestUserId}
                onChange={(e) => setGuestUserId(e.target.value)}
                placeholder="User ID 입력"
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #ddd",
                }}
              />
            </label>

            <button
              type="submit"
              style={{
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
                fontWeight: 700,
                background: "#6c757d",
                color: "white",
              }}
              disabled={guestLoading}
            >
              게스트로 조회
            </button>
          </form>
        </div>
      )}

      <div style={{ marginTop: 12, color: "#666" }}>
        계정이 없나요? <Link to="/register">회원가입</Link>
      </div>
    </div>
  );
}
