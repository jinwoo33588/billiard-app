import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export default function RegisterPage() {
  const nav = useNavigate();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [handicap, setHandicap] = useState<number>(26);
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");

    try {
      await register({
        email,
        password,
        nickname,
        handicap: Number(handicap),
      });
      nav("/me");
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? "Register failed";
      setErr(msg);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
      <h2 style={{ margin: "12px 0 8px" }}>회원가입</h2>
      <p style={{ marginTop: 0, color: "#666" }}>정보를 입력하고 시작하세요.</p>

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
            type="password"
            style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
            autoComplete="new-password"
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14 }}>닉네임</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 14 }}>핸디</span>
          <input
            value={handicap}
            onChange={(e) => setHandicap(Number(e.target.value))}
            inputMode="numeric"
            style={{ padding: 12, borderRadius: 10, border: "1px solid #ddd" }}
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
          가입하고 시작
        </button>
      </form>

      <div style={{ marginTop: 12, color: "#666" }}>
        이미 계정이 있나요? <Link to="/login">로그인</Link>
      </div>
    </div>
  );
}