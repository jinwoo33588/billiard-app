import type { HandicapBenchmark } from "./types";

export function getBenchmarkFromRows(rows: HandicapBenchmark[] | null, handicap: number) {
  if (!rows?.length) return null;
  const h = Math.round(Number(handicap) || 0);

  // exact
  const exact = rows.find((r) => r.handicap === h);
  if (exact) return exact;

  // clamp 범위 밖 처리 (네 테이블이 15~30이라면)
  const minH = Math.min(...rows.map((r) => r.handicap));
  const maxH = Math.max(...rows.map((r) => r.handicap));

  const clamped = Math.max(minH, Math.min(maxH, h));
  const exact2 = rows.find((r) => r.handicap === clamped);
  if (exact2) return exact2;

  // 주변 탐색(누락 대비)
  for (let d = 1; d <= 30; d++) {
    const down = rows.find((r) => r.handicap === h - d);
    if (down) return down;
    const up = rows.find((r) => r.handicap === h + d);
    if (up) return up;
  }

  return rows[0] ?? null;
}