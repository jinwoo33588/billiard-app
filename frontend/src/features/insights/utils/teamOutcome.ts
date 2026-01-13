// frontend/src/features/insights/utils/teamOutcome.ts

export type OutcomeCategory =
  | "CARRY_WIN"     // 캐리승 (잘침 + 승)
  | "NORMAL_WIN"    // 보통승 (보통 + 승)
  | "BUS_WIN"       // 버스승 (못침 + 승)
  | "HARD_LOSE"     // 억울패 (잘침 + 패)
  | "NORMAL_LOSE"   // 보통패 (보통 + 패)
  | "SELF_LOSE";    // 내탓패 (못침 + 패)

export function classifyTeamOutcome({
  gps,
  result,
  goodCut = 55,
  badCut = 45,
}: {
  gps: number;
  result: string; // "WIN" | "LOSE" | etc
  goodCut?: number;
  badCut?: number;
}): OutcomeCategory {
  const g = Number(gps);
  const isWin = String(result) === "WIN";
  const isLose = String(result) === "LOSE";

  // 방어: gps가 NaN이면 보통으로 처리(승패만 반영)
  const good = Number.isFinite(g) && g >= goodCut;
  const bad = Number.isFinite(g) && g <= badCut;

  if (isWin && good) return "CARRY_WIN";
  if (isWin && bad) return "BUS_WIN";
  if (isWin) return "NORMAL_WIN";

  if (isLose && good) return "HARD_LOSE";
  if (isLose && bad) return "SELF_LOSE";
  return "NORMAL_LOSE";
}

/**
 * ✅ 6분류 요약
 * opts.includeNeutral:
 * - 예전 NEUTRAL 분모 제외용이었는데, 이제 NEUTRAL 없음
 * - 대신 "결정판(WIN/LOSE)만 분모로 쓸지"로 해석하는 걸 추천
 *   - true  => 모든 게임을 분모로 (기본)
 *   - false => WIN/LOSE만 분모로 (무/기권/기타 결과는 분모 제외)
 */
export function summarizeTeamOutcomes<T extends { gps: number; result: string }>(
  games: T[] | null | undefined,
  opts?: { goodCut?: number; badCut?: number; includeNeutral?: boolean }
) {
  const goodCut = opts?.goodCut ?? 55;
  const badCut = opts?.badCut ?? 45;
  const includeNeutral = opts?.includeNeutral ?? true;

  const counts: Record<OutcomeCategory, number> = {
    CARRY_WIN: 0,
    NORMAL_WIN: 0,
    BUS_WIN: 0,
    HARD_LOSE: 0,
    NORMAL_LOSE: 0,
    SELF_LOSE: 0,
  };

  const list = Array.isArray(games) ? games : [];

  // 분모 계산용 decided 카운트
  let decidedN = 0;

  for (const g of list) {
    const r = String(g.result);
    const decided = r === "WIN" || r === "LOSE";
    if (decided) decidedN += 1;

    // 결과가 WIN/LOSE가 아니어도 일단 분류는 "보통승/보통패"로 떨어질 수 있어서
    // 아예 제외하고 싶으면 아래 if로 막아도 됨.
    // if (!decided) continue;

    const c = classifyTeamOutcome({ gps: g.gps, result: r, goodCut, badCut });
    counts[c] += 1;
  }

  const denom = includeNeutral ? list.length : decidedN;
  const d = denom > 0 ? denom : 1;

  const rate = (x: number) => Math.round((x / d) * 1000) / 10;

  const rates: Record<OutcomeCategory, number> = {
    CARRY_WIN: rate(counts.CARRY_WIN),
    NORMAL_WIN: rate(counts.NORMAL_WIN),
    BUS_WIN: rate(counts.BUS_WIN),
    HARD_LOSE: rate(counts.HARD_LOSE),
    NORMAL_LOSE: rate(counts.NORMAL_LOSE),
    SELF_LOSE: rate(counts.SELF_LOSE),
  };

  return {
    sampleN: list.length,
    decidedN,
    policy: { goodCut, badCut, includeNeutral },
    counts,
    rates,
  };
}