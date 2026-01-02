// backend/services/insights/formAnalysis.js

const { getBenchmark } = require('../../constants/handicapBenchmarks');
const { calcStats } = require('../stats/stats.calc');

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function round(n, d) {
  const x = num(n, 0);
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

/**
 * delta(실제-기대) 기준 상태 판단
 * - 네가 원하는대로 threshold 쉽게 수정 가능
 */
function statusFromDelta(delta, sampleN) {
  if (sampleN < 5) return '데이터부족';
  if (delta >= 0.050) return '매우좋음';
  if (delta >= 0.020) return '좋음';
  if (delta >= -0.020) return '보통';
  if (delta >= -0.050) return '부진';
  return '매우부진';
}

/**
 * handicap 추천(예시)
 * - delta가 양수면 “핸디 올려도 됨” (난이도 올리기)
 * - delta가 음수면 “핸디 내려도 됨”
 * - 실제 룰/의미는 너 앱 기준으로 바꾸면 됨
 */
function recommendFromDelta(delta, sampleN) {
  if (sampleN < 5) return { handicapDelta: 0, label: '표본 부족: 유지' };

  // delta 단위가 0.01만 바뀌어도 체감이 있으니 보수적으로
  if (delta >= 0.060) return { handicapDelta: +2, label: '핸디 +2 권장' };
  if (delta >= 0.035) return { handicapDelta: +1, label: '핸디 +1 권장' };
  if (delta <= -0.060) return { handicapDelta: -2, label: '핸디 -2 권장' };
  if (delta <= -0.035) return { handicapDelta: -1, label: '핸디 -1 권장' };
  return { handicapDelta: 0, label: '핸디 유지' };
}

function buildReasons({ stats, bench, delta, sampleN }) {
  const reasons = [];
  if (!stats || sampleN < 5) {
    reasons.push('최근 기록 표본이 부족해서 확정 판단이 어려워요. (최소 5판 권장)');
    return reasons;
  }

  reasons.push(
    `최근 평균 에버 ${stats.average.toFixed(3)} (기대 ${bench.expected.toFixed(3)}, Δ ${delta >= 0 ? '+' : ''}${delta.toFixed(3)})`
  );

  reasons.push(`승률(무 제외) ${stats.winRate.toFixed(1)}% (${stats.wins}승 ${stats.losses}패)`);

  // volatility는 “기복” 지표
  reasons.push(`기복(표준편차) ${stats.volatility.toFixed(3)} (낮을수록 안정적)`);

  if (stats.bestAverage > 0) reasons.push(`단일 최고 에버 ${stats.bestAverage.toFixed(3)}`);
  if (stats.bestScore > 0) reasons.push(`단일 최고 점수 ${Math.round(stats.bestScore)}점`);

  return reasons;
}

/**
 * ✅ 폼 분석 결과(인사이트 all 파트에 붙는 데이터)
 */
function analyzeForm(games, handicap) {
  const bench = getBenchmark(handicap);
  const stats = calcStats(games); // stats.calc.js 결과 shape 사용

  // stats.average는 총점/총이닝 (= 네 프론트에서 최근Avg로 쓰던 값과 동일)
  const recentAvg = num(stats.average, 0);
  const expected = num(bench.expected, 0);

  const delta = round(recentAvg - expected, 3);
  const sampleN = Array.isArray(games) ? games.length : 0;

  const status = statusFromDelta(delta, sampleN);
  const recommendation = recommendFromDelta(delta, sampleN);

  return {
    status,
    recommendation,
    benchmark: {
      handicap: Math.round(num(handicap, 0)),
      expected: bench.expected,
      min: bench.min,
      max: bench.max,
    },

    // ✅ 프론트가 기대하는 stats 형태(혹시 없으면 null)
    stats: sampleN > 0
      ? {
          totalGames: stats.totalGames,
          wins: stats.wins,
          draws: stats.draws,
          losses: stats.losses,
          recentAvg: round(recentAvg, 3),
          winRate: round(stats.winRate, 1),
          volatility: round(stats.volatility, 3),
          delta: round(delta, 3),
        }
      : null,

    reasons: buildReasons({ stats, bench, delta, sampleN }),
  };
}

module.exports = { analyzeForm };