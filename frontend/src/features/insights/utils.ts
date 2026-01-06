import type { TeamGameRow } from "./types";

export function fmt(n: any, d = 3) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(d);
}

export function fmt0(n: any) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return String(Math.round(x));
}

export function clamp01(v: any) {
  const x = Number(v);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(100, x));
}

export function statusMeta(status: string) {
  const s = String(status || "");
  if (s.includes("매우좋")) return { color: "teal", emoji: "🔥", label: "매우 좋음" } as const;
  if (s.includes("좋")) return { color: "green", emoji: "✅", label: "좋음" } as const;
  if (s.includes("보통")) return { color: "gray", emoji: "🙂", label: "보통" } as const;
  if (s.includes("부진")) return { color: "orange", emoji: "🧊", label: "부진" } as const;
  if (s.includes("데이터")) return { color: "gray", emoji: "🧩", label: "데이터 부족" } as const;
  return { color: "gray", emoji: "ℹ️", label: status || "상태" } as const;
}

export function labelMeta(label: TeamGameRow["label"]) {
  switch (label) {
    case "CARRY": return { color: "teal", text: "🔥 캐리" } as const;
    case "BUS": return { color: "yellow", text: "🚌 버스" } as const;
    case "LUCK_BAD": return { color: "red", text: "🎲 억울" } as const;
    case "SELF_ISSUE": return { color: "orange", text: "🧊 내 이슈" } as const;
    default: return { color: "gray", text: "✅ 중립" } as const;
  }
}

export function gpsColor(gps: number) {
  if (gps >= 75) return "teal";
  if (gps >= 60) return "green";
  if (gps <= 40) return "red";
  return "gray";
}

export function skillScore(delta: number) {
  const v = Math.max(-0.1, Math.min(0.1, Number(delta)));
  return Math.round(((v + 0.1) / 0.2) * 100);
}

export function niceDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}