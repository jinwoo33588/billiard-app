// src/app/bootstrap.ts
const PROD_HOST = import.meta.env.VITE_PROD_HOST; // 예: billiard-app.vercel.app

export function redirectIfPreviewHost() {
  if (typeof window === "undefined") return;
  if (!PROD_HOST) return; // 환경변수 없으면 일단 패스

  const host = window.location.hostname;

  // vercel preview 패턴: git-xxxx / 해시 붙은 서브도메인 등
  const isVercel = host.endsWith(".vercel.app");
  const isNotProd = host !== PROD_HOST;

  // "billiard-app.vercel.app"만 허용, 나머지 vercel.app은 전부 production으로 보냄
  if (isVercel && isNotProd) {
    const next = `https://${PROD_HOST}${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(next);
  }
}