import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");

    try {
      await login(email, password);
      nav("/");
    } catch (e: any) {
      // axios 에러면 보통 e.response.data.message 형태
      const msg = e?.response?.data?.message ?? "Login failed";
      setErr(msg);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "12px 0 8px" }}>로그인</h2>
      <p style={{ marginTop: 0, color: "#666" }}>계정으로 로그인하세요.</p>

      {err && (
        <div style={{ background: "#ffecec", padding: 12, borderRadius: 10, marginTop: 12 }}>
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14 }}>이메일</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="a@a.com"
            style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
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
            style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
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

      <div style={{ marginTop: 12, color: "#666" }}>
        계정이 없나요? <Link to="/register">회원가입</Link>
      </div>
    </div>
  );
}
