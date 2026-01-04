// src/features/stats/query.ts
import type { StatsSelector } from "./types";

function clampInt(n: any, min: number, max: number, fallback: number) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

/** ✅ selector를 query로 직렬화 (flat stats용) */
export function selectorToQuery(sel: StatsSelector): Record<string, string> {
  switch (sel.type) {
    case "all":
      return { type: "all" };

    case "lastN":
      return { type: "lastN", n: String(clampInt(sel.n, 1, 2000, 10)) };

    case "range":
      return {
        type: "range",
        ...(sel.from ? { from: sel.from } : {}),
        ...(sel.to ? { to: sel.to } : {}),
      };

    case "thisMonth":
      return { type: "thisMonth", ...(sel.now ? { now: sel.now } : {}) };

    case "yearMonth":
      return {
        type: "yearMonth",
        year: String(clampInt(sel.year, 1970, 3000, new Date().getFullYear())),
        month: String(clampInt(sel.month, 1, 12, new Date().getMonth() + 1)),
      };

    default:
      return { type: "all" };
  }
}