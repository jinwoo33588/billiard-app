// backend/services/insights/insights.calc.js
// - 총점 100 = avg점수(90 기준) + 승률점수(최대 10)
// - "avg=expected" & "winRateNoDraw=0.63" => '적정(90~95)'에 들어가게 보정

const httpError = require("../../utils/httpError");
const { lookupHandicapBenchmark } = require("./handicap.lookup");

// 안전 나눗셈
function safeDiv(a, b) {
  return b > 0 ? a / b : 0;
}

// clamp
function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

// 선형 보간(0~1)
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * ✅ avg 점수 (max 기준 선형 환산)
 * - avg == max -> 90점
 * - avgScore = 90 * (avg / max)
 * - clamp 없음
 */
function calcAvgScore(avg, bench) {
  const { max } = bench;
  if (!Number.isFinite(avg) || avg <= 0) return 0;

  const base = 90;
  return base * (avg / Math.max(max, 1e-9));
}

/**
 * ✅ 승률 점수 (0~10)
 * - winScore = 10 * winRate
 * - 평균(66.6%)은 6.66점
 * - 10점 상한 적용
 */
function calcWinScore(winRate) {
  const wr = Number(winRate);
  if (!Number.isFinite(wr) || wr <= 0) return 0;
  return clamp(10 * wr, 0, 10);
}

/**
 * ✅ 총점에 따른 핸디 추천
 * - 105+ : 강제 핸디업
 * - 100~105 : +1 권장
 * - 95~100 : 평균보다 약간 높음
 * - 90~95 : 적정
 * - 85~90 : 평균보다 약간 낮음
 * - 80~85 : -1 권장
 * - <80 : 강제 핸디다운
 */
function judge(total) {
  if (total >= 105) return { band: "force_up", delta: +2, text: "강제 핸디업" };
  if (total >= 100) return { band: "suggest_up", delta: +1, text: "+1 권장" };
  if (total >= 95) return { band: "slightly_high", delta: 0, text: "핸디 평균보다 약간 높은 실력" };
  if (total >= 90) return { band: "ok", delta: 0, text: "적정" };
  if (total >= 85) return { band: "slightly_low", delta: 0, text: "핸디 평균보다 약간 낮은 실력" };
  if (total >= 80) return { band: "suggest_down", delta: -1, text: "-1 권장" };
  return { band: "force_down", delta: -2, text: "강제 핸디다운" };
}

/**
 * ✅ 외부에서 쓰는 메인 함수
 * @param {{
 *  handicap: number,
 *  avg: number,                 // scoreSum/inningSum (무관)
 *  winRate: number,       // wins/(wins+loses)
 * }} input
 */
function calcHandicapScore(input) {
  const h = Number(input?.handicap);
  const avg = Number(input?.avg);
  const winRate = Number(input?.winRate);

  if (!Number.isFinite(h)) throw httpError(400, "handicap is required");
  if (!Number.isFinite(avg)) throw httpError(400, "avg is required");
  if (!Number.isFinite(winRate)) throw httpError(400, "winRate is required");

  const bench = lookupHandicapBenchmark(h);

  const avgScore = calcAvgScore(avg, bench);
  const winScore = calcWinScore(winRate);

  const total = avgScore + winScore;
  const verdict = judge(total);

  // 참고용: 기대 대비 편차
  const avgDelta = avg - bench.expected;

  return {
    handicap: h,
    benchmark: {
      expected: bench.expected,
      min: bench.min,
      max: bench.max,
      mode: bench.mode,
    },

    inputs: {
      avg,
      winRate,
    },

    scores: {
      total: Number(total.toFixed(2)),
      avgScore: Number(avgScore.toFixed(2)),
      winScore: Number(winScore.toFixed(2)),
    },

    deltas: {
      avgDelta: Number(avgDelta.toFixed(3)),
      // 비율이 필요하면:
      avgRatio: Number(safeDiv(avg, bench.expected).toFixed(3)),
    },

    verdict, // { band, delta, text }
  };
}

module.exports = {
  calcHandicapScore,
};
