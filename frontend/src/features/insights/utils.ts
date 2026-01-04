import type { InsightAnalysis, TeamIndicators } from "./types";

export function statusMeta(status: InsightAnalysis["status"]) {
  switch (status) {
    case "매우좋음":
      return { color: "green", label: "매우 좋음", emoji: "🔥" } as const;
    case "좋음":
      return { color: "teal", label: "좋음", emoji: "⬆️" } as const;
    case "보통":
      return { color: "blue", label: "보통", emoji: "➖" } as const;
    case "부진":
      return { color: "orange", label: "부진", emoji: "⬇️" } as const;
    case "매우부진":
      return { color: "red", label: "매우 부진", emoji: "🧊" } as const;
    case "데이터부족":
    default:
      return { color: "gray", label: "데이터 부족", emoji: "🧪" } as const;
  }
}

export function fmt(n: number | null | undefined, d: number) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "-";
  return Number(n).toFixed(d);
}

export function getConfidence(sampleN: number) {
  let level: "높음" | "보통" | "낮음" = "낮음";
  if (sampleN >= 20) level = "높음";
  else if (sampleN >= 10) level = "보통";
  const color = level === "높음" ? "green" : level === "보통" ? "blue" : "gray";
  return { level, color } as const;
}

export function splitReasons(reasons: string[], topN = 2) {
  return { top: reasons.slice(0, topN), rest: reasons.slice(topN) };
}

/** (옵션) 팀전 표본 부족 방어용 */
export function safeTeamSampleN(team?: TeamIndicators | null) {
  const n = Number(team?.sampleN ?? 0);
  return Number.isFinite(n) ? n : 0;
}