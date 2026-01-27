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
 * ✅ avg 점수 (0~90 기준선, 필요 시 95까지 약간 가산)
 * - avg == expected -> 90점
 * - avg == min -> 85점
 * - avg == max -> 95점
 * - 그 밖은 구간별 선형 + clamp
 */
function calcAvgScore(avg, bench) {
  const { expected, min, max } = bench;

  if (!Number.isFinite(avg) || avg <= 0) return 0;

  // 분모가 0이 되는 경우 방어
  const leftDen = Math.max(expected - min, 1e-9);
  const rightDen = Math.max(max - expected, 1e-9);

  if (avg <= expected) {
    // min -> 85, expected -> 90
    const t = clamp((avg - min) / leftDen, 0, 1);
    return lerp(85, 90, t);
  }

  // expected -> 90, max -> 95
  const t = clamp((avg - expected) / rightDen, 0, 1);
  return lerp(90, 95, t);
}

/**
 * ✅ 승률 점수 (0~10)
 * 요구사항: winRateNoDraw=0.63이 "적정"이 되도록 너무 높은 점수 주지 않기.
 *
 * 설계:
 * - target(0.63)에서 2.5점 (=> avg=expected(90)일 때 총점 92.5 = 적정 중앙)
 * - floor(0.45) 이하면 0점
 * - ceil(0.80) 이상이면 10점
 * - 구간별 선형
 */
function calcWinScore(winRate, opt = {}) {
  const {
    target = 0.63,
    scoreAtTarget = 2.5,
    floor = 0.45,
    ceil = 0.8,
  } = opt;

  const wr = Number(winRate);
  if (!Number.isFinite(wr)) return 0;

  if (wr <= floor) return 0;
  if (wr >= ceil) return 10;

  if (wr <= target) {
    // floor -> 0점, target -> scoreAtTarget
    const t = (wr - floor) / Math.max(target - floor, 1e-9);
    return lerp(0, scoreAtTarget, clamp(t, 0, 1));
  }

  // target -> scoreAtTarget, ceil -> 10점
  const t = (wr - target) / Math.max(ceil - target, 1e-9);
  return lerp(scoreAtTarget, 10, clamp(t, 0, 1));
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

  const avgScore = calcAvgScore(avg, bench);           // 대략 0~95
  const winScore = calcWinScore(winRate, {
    target: 0.63,          // ✅ 요구사항: 0.63을 적정 기준으로
    scoreAtTarget: 2.5,    // ✅ avg=expected(90)일 때 총점 92.5 = 적정 중앙
    floor: 0.45,
    ceil: 0.8,
  }); // 0~10

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