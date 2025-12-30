// backend/services/insights.service.js
const User = require('../models/User');
const Game = require('../models/Game');
const { HANDICAP_BENCHMARKS } = require('../constants/handicapBenchmarks');

function round(n, d = 2) {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
}

function pickRecentGames(games, windowSize) {
  return [...games]
    .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
    .slice(0, windowSize);
}

function summarize(games) {
  const valid = games.filter((g) => (Number(g.inning) || 0) > 0);

  const totalGames = games.length;
  const wins = games.filter((g) => g.result === '승').length;
  const draws = games.filter((g) => g.result === '무').length;
  const losses = games.filter((g) => g.result === '패').length;

  const totalScore = valid.reduce((acc, g) => acc + (Number(g.score) || 0), 0);
  const totalInnings = valid.reduce((acc, g) => acc + (Number(g.inning) || 0), 0);
  const recentAvg = totalInnings > 0 ? totalScore / totalInnings : 0;

  const denom = wins + losses;
  const winRate = denom > 0 ? (wins / denom) * 100 : 0;

  // 표준편차 기반 기복
  const avgs = valid.map((g) => (Number(g.inning) > 0 ? Number(g.score) / Number(g.inning) : 0));
  const mean = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0;
  const variance = avgs.length ? avgs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / avgs.length : 0;
  const volatility = Math.sqrt(variance);

  return {
    totalGames,
    wins,
    draws,
    losses,
    recentAvg: round(recentAvg, 3),
    winRate: round(winRate, 1),
    volatility: round(volatility, 3),
  };
}

/**
 * ✅ handicap -> { expected, min, max }
 * - 테이블이 배열이므로 find로 찾고
 * - 없으면 가장 가까운 handicap을 사용
 * - 항상 number로 반환(에러 방지)
 */
function getBenchmarkByHandicap(handicap) {
  const h = Number(handicap);
  if (!Number.isFinite(h) || !Array.isArray(HANDICAP_BENCHMARKS) || HANDICAP_BENCHMARKS.length === 0) {
    return { expected: 0.55, min: 0.52, max: 0.58 };
  }

  const exact = HANDICAP_BENCHMARKS.find((b) => Number(b.handicap) === h);
  if (exact) {
    return {
      expected: Number(exact.expected),
      min: Number(exact.min),
      max: Number(exact.max),
    };
  }

  const nearest = [...HANDICAP_BENCHMARKS].sort(
    (a, b) => Math.abs(Number(a.handicap) - h) - Math.abs(Number(b.handicap) - h)
  )[0];

  return {
    expected: Number(nearest.expected),
    min: Number(nearest.min),
    max: Number(nearest.max),
  };
}

/** ✅ 폼 분석(전체 흐름): benchmark(min/max) 기반 */
function analyzeForm(windowGames, handicap) {
  const benchmark = getBenchmarkByHandicap(handicap);

  // 최종 안전장치(혹시 값이 이상해도 터지지 않게)
  const expected = Number(benchmark.expected);
  const min = Number(benchmark.min);
  const max = Number(benchmark.max);

  const safeExpected = Number.isFinite(expected) ? expected : 0.55;
  const safeMin = Number.isFinite(min) ? min : safeExpected - 0.03;
  const safeMax = Number.isFinite(max) ? max : safeExpected + 0.03;

  const s = summarize(windowGames);

  if (s.totalGames < 5) {
    return {
      status: '데이터부족',
      recommendation: { handicapDelta: 0, label: '표본 부족' },
      benchmark: { handicap: Number(handicap) || 0, expected: safeExpected, min: safeMin, max: safeMax },
      stats: null,
      reasons: ['최근 경기 수가 적어서 분석 신뢰도가 낮습니다. (최소 5판 권장)'],
    };
  }

  // “매우” 구간: 정상 범위(min~max)를 확실히 벗어난 정도
  const veryGap = 0.05; // ✅ 너가 바꿀 값

  let status = '보통';
  if (s.recentAvg >= safeMax + veryGap) status = '매우좋음';
  else if (s.recentAvg >= safeMax) status = '좋음';
  else if (s.recentAvg <= safeMin - veryGap) status = '매우부진';
  else if (s.recentAvg <= safeMin) status = '부진';

  // 핸디 조정 추천(예시)
  let handicapDelta = 0;
  if (status === '매우좋음') handicapDelta = +2;
  else if (status === '좋음') handicapDelta = +1;
  else if (status === '매우부진') handicapDelta = -2;
  else if (status === '부진') handicapDelta = -1;

  const delta = round(s.recentAvg - safeExpected, 3);

  const reasons = [];
  reasons.push(
    `최근 평균 에버리지 ${s.recentAvg.toFixed(3)} (기대 ${safeExpected.toFixed(3)}, 정상 ${safeMin.toFixed(3)}~${safeMax.toFixed(3)})`
  );
  reasons.push(`기대 대비 Δ ${delta >= 0 ? '+' : ''}${delta.toFixed(3)}`);
  reasons.push(`승률(무 제외) ${s.winRate.toFixed(1)}% · 기복(표준편차) ${s.volatility.toFixed(3)}`);

  if (s.volatility >= 0.12) reasons.push('기복이 큰 편이라 “컨디션/루틴” 영향이 있을 수 있어요.');
  if (s.winRate <= 35 && s.recentAvg >= safeExpected) reasons.push('에버는 나쁘지 않은데 승률이 낮아 “팀/매칭 영향” 가능성이 있어요.');
  if (s.winRate >= 65 && s.recentAvg < safeExpected) reasons.push('승률은 높은데 에버가 낮아 “버스/상대 실수” 영향 가능성이 있어요.');

  return {
    status,
    recommendation: {
      handicapDelta,
      label:
        handicapDelta > 0
          ? `핸디 +${handicapDelta} 추천`
          : handicapDelta < 0
          ? `핸디 ${handicapDelta} 추천`
          : '핸디 유지 추천',
    },
    benchmark: { handicap: Number(handicap) || 0, expected: safeExpected, min: safeMin, max: safeMax },
    stats: { ...s, delta },
    reasons,
  };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function safeAvg(game) {
  const inning = Number(game.inning) || 0;
  const score = Number(game.score) || 0;
  if (inning <= 0) return null;
  return score / inning;
}

/** ✅ 팀전 판별 */
function isTeamGame(gameType) {
  return ['2v2', '2v2v2', '3v3', '3v3v3'].includes(String(gameType || ''));
}

/** ✅ 강도 가중치(구간형: 너가 수정하기 쉬움) */
function weightByDiff(diff) {
  const a = Math.abs(diff);
  if (a >= 8) return 3;
  if (a >= 5) return 2;
  if (a >= 2) return 1;
  return 0.5;
}

function classifyTeamGameWithDiff(game, handicap) {
  const score = Number(game.score) || 0;
  const H = Number(handicap) || 0;
  const diff = score - H;

  if (game.result === '무') return { tag: 'DRAW', diff };

  const over = diff >= 0;
  if (over && game.result === '패') return { tag: 'TEAM_LUCK_BAD', diff };        // 할만패
  if (!over && game.result === '승') return { tag: 'TEAM_CARRY', diff };         // 덜승(버스)
  if (!over && game.result === '패') return { tag: 'NEED_IMPROVE', diff };       // 덜패(내 부족)
  if (over && game.result === '승') return { tag: 'TEAM_SYNERGY_GOOD', diff };   // 할승(시너지)

  return { tag: 'UNKNOWN', diff };
}

function buildTeamIndicators(teamGames, handicap) {
  // ✅ 팀전 중 승/패만 분석 대상으로 (무는 중립)
  const relevant = teamGames.filter((g) => g.result === '승' || g.result === '패');

  // 표본 부족 처리
  if (relevant.length === 0) {
    return {
      sampleN: 0,
      counts: { TEAM_LUCK_BAD: 0, BUS: 0, CARRY: 0, SELF_ISSUE: 0, NEUTRAL: 0 },
      rates: { teamLuckBadRate: 0, busRate: 0, carryRate: 0, selfIssueRate: 0 },
      weighted: { luckBadScore: 0, busScore: 0, carryScore: 0, selfIssueScore: 0 },
      diffSummary: { avgDiff: 0, overRate: 0, underRate: 0, meanOver: 0, meanUnder: 0 },
      extremes: { bestCarry: null, biggestBus: null },
      headline: '팀전 데이터가 없습니다.',
      note: 'diff = (내 점수 score) - (내 핸디 handicap). avg = score/inning.',
    };
  }

  // ✅ benchmark 기반 expected (에버 기준점)
  const { expected: safeExpected } = getBenchmarkByHandicap(handicap);

  // ✅ 조절 노브(너가 수정하기 쉬운 파라미터)
  const diffScale = 6;    // diff가 6점 차이면 거의 극단(-1/+1)으로 본다
  const avgScale = 0.15;  // expected 대비 0.15 차이면 거의 극단(-1/+1)
  const wDiff = 0.7;      // perf에서 diff 비중
  const wAvg = 0.3;       // perf에서 avg 비중
  const busDiscountByAvg = 0.6; // 덜 쳤더라도 avg가 좋으면 "버스" 감산 비율(최대 60%)
  const neutralMargin = 0.12;   // 네 가지 점수 모두 작으면 “중립” 처리 기준

  // 누적(0~1 스케일의 합)
  let sumLuckBad = 0;
  let sumBus = 0;
  let sumCarry = 0;
  let sumSelf = 0;

  // counts(몇 판이 어떤 성격이 강했는지)
  const counts = { TEAM_LUCK_BAD: 0, BUS: 0, CARRY: 0, SELF_ISSUE: 0, NEUTRAL: 0 };

  // diff 요약
  let sumDiff = 0;
  let overCount = 0;
  let underCount = 0;
  let overDiffSum = 0;
  let overN = 0;
  let underDiffSum = 0;
  let underN = 0;

  // extremes
  let bestCarry = null;   // diff 가장 큰 경기
  let biggestBus = null;  // diff 가장 작은(가장 음수) 경기

  for (const g of relevant) {
    const score = Number(g.score) || 0;
    const H = Number(handicap) || 0;
    const diff = score - H;

    const avg = safeAvg(g); // null 가능
    const avgVal = typeof avg === 'number' ? avg : safeExpected; // inning 0이면 expected로 대체

    // -1~+1 정규화
    const diffNorm = clamp(diff / diffScale, -1, 1);
    const avgNorm = clamp((avgVal - safeExpected) / avgScale, -1, 1);

    // perf: -1(못함) ~ +1(잘함)
    const perf = clamp(wDiff * diffNorm + wAvg * avgNorm, -1, 1);

    // outcome: 승(+1), 패(-1)
    const outcome = g.result === '승' ? 1 : -1;

    // ✅ 핵심: "결과(outcome)"와 "기여(perf)"를 합성해서 4개 점수로 분해
    const luckBad = Math.max(0, perf) * (outcome === -1 ? 1 : 0);     // 잘했는데 짐 = 억울(팀운 나쁨)
    const carry = Math.max(0, perf) * (outcome === +1 ? 1 : 0);       // 잘해서 이김 = 캐리/기여
    const selfIssue = Math.max(0, -perf) * (outcome === -1 ? 1 : 0);  // 못했는데 짐 = 내 문제
    const busRaw = Math.max(0, -perf) * (outcome === +1 ? 1 : 0);     // 못했는데 이김 = 버스

    // ✅ “에버가 좋은 덜승”은 버스 감산
    const discount = clamp(avgNorm, 0, 1) * busDiscountByAvg; // avgNorm이 +면 최대 0.6 감산
    const bus = busRaw * (1 - discount);

    // (선택) diff 차이가 큰 경기는 조금 더 비중 주고 싶으면 가중치 적용 가능
    // const intensity = 0.6 + 0.4 * Math.abs(diffNorm); // 0.6~1.0
    // sumLuckBad += luckBad * intensity; ... 식으로 바꾸면 됨

    sumLuckBad += luckBad;
    sumCarry += carry;
    sumSelf += selfIssue;
    sumBus += bus;

    // counts: 그 경기에서 가장 강한 성격 1개를 카운트
    const arr = [
      { k: 'TEAM_LUCK_BAD', v: luckBad },
      { k: 'CARRY', v: carry },
      { k: 'SELF_ISSUE', v: selfIssue },
      { k: 'BUS', v: bus },
    ];
    arr.sort((a, b) => b.v - a.v);

    if (arr[0].v < neutralMargin) counts.NEUTRAL += 1;
    else counts[arr[0].k] += 1;

    // diff summary
    sumDiff += diff;
    if (diff >= 0) {
      overCount++;
      overDiffSum += diff;
      overN++;
    } else {
      underCount++;
      underDiffSum += diff; // 음수
      underN++;
    }

    // extremes (diff 기준)
    const gameId = String(g._id);
    const date = g.gameDate;

    if (!bestCarry || diff > bestCarry.diff) bestCarry = { gameId, date, diff, result: g.result };
    if (!biggestBus || diff < biggestBus.diff) biggestBus = { gameId, date, diff, result: g.result };
  }

  const sampleN = relevant.length;

  // 0~100 지표(평균값 * 100)
  const toIndex = (sum) => (sampleN > 0 ? Math.round((sum / sampleN) * 100) : 0);

  const weighted = {
    luckBadScore: toIndex(sumLuckBad),
    busScore: toIndex(sumBus),
    carryScore: toIndex(sumCarry),
    selfIssueScore: toIndex(sumSelf),
  };

  // rates(어떤 성격이 많이 나왔는지 %)
  const pct = (x) => (sampleN > 0 ? Math.round((x / sampleN) * 100) : 0);
  const rates = {
    teamLuckBadRate: pct(counts.TEAM_LUCK_BAD),
    busRate: pct(counts.BUS),
    carryRate: pct(counts.CARRY),
    selfIssueRate: pct(counts.SELF_ISSUE),
  };

  const diffSummary = {
    avgDiff: sampleN > 0 ? round(sumDiff / sampleN, 2) : 0,
    overRate: sampleN > 0 ? pct(overCount) : 0,
    underRate: sampleN > 0 ? pct(underCount) : 0,
    meanOver: overN > 0 ? round(overDiffSum / overN, 2) : 0,
    meanUnder: underN > 0 ? round(underDiffSum / underN, 2) : 0,
  };

  // headline: 가장 강한 인덱스로 요약
  const top = [
    { k: 'TEAM_LUCK_BAD', v: weighted.luckBadScore, label: '팀운(억울한 패배) 강함' },
    { k: 'BUS', v: weighted.busScore, label: '버스(덜승) 경향' },
    { k: 'CARRY', v: weighted.carryScore, label: '캐리/기여 경향' },
    { k: 'SELF_ISSUE', v: weighted.selfIssueScore, label: '내 실력/컨디션 이슈' },
  ].sort((a, b) => b.v - a.v)[0];

  let headline = '최근 팀전은 균형적인 편이에요.';
  if (sampleN < 5) headline = '팀전 표본이 적어 참고용이에요.';
  else if (top.v >= 35) headline = `최근 팀전: ${top.label}`;

  return {
    sampleN,
    counts,
    rates,
    weighted,
    diffSummary,
    extremes: { bestCarry, biggestBus },
    headline,
    note:
      '1경기마다 perf(내 기여도: diff+avg)와 outcome(승패)을 합성해 팀운/버스/캐리/내탓 점수를 만들고, 최근 N판 평균을 0~100 인덱스로 반환합니다.',
  };
}

async function getInsightsForUser(userId, windowSize = 10) {
  const user = await User.findById(userId).select('handicap nickname');
  if (!user) throw new Error('User not found');

  const handicap = Number(user.handicap) || 0;

  const allGames = await Game.find({ userId }).sort({ gameDate: -1 });
  const windowGames = pickRecentGames(allGames, windowSize);

  // ✅ 폼: 전체 흐름(개인/팀 섞어서)
  const allAnalysis = analyzeForm(windowGames, handicap);

  // ✅ 팀운: window 안에서 팀전만
  const teamWindow = windowGames.filter((g) => isTeamGame(g.gameType));
  const teamIndicators = buildTeamIndicators(teamWindow, handicap);

  return {
    window: windowSize,
    handicap,
    updatedAt: new Date().toISOString(),
    all: {
      gameType: 'ALL',
      sampleN: windowGames.length,
      ...allAnalysis,
    },
    teamIndicators,
  };
}

module.exports = { getInsightsForUser };