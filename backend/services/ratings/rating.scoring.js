const { clamp, round, num } = require("../../utils/num");

/**
 * Per-game Rating (0~100 or raw)
 * - avg를 handicap 기대밴드(min~max) 기준으로 base 점수화
 * - handicap 초과 득점은 상쇄 보너스
 * - avg가 적정(>=min)이면 score<handicap이어도 penalty=0
 */

const DEFAULT_PARAMS = {
  baseDeltaUp: 0.3, // expected +0.3 -> +50점
  baseDeltaDown: 0.2, // expected -0.2 -> -50점 (하락 더 빠르게)
  Bmax: 60,
  M: 2,
  Pmax: 18,
  S: 10,
};

function clamp01(x) {
  return clamp(x, 0, 1);
}

function safeDivisor(x) {
  return Math.max(1e-9, num(x, 0));
}

function calcAvg(score, inning) {
  const s = num(score, 0);
  const inn = Math.max(1, num(inning, 1));
  return s / inn;
}

function calcBaseFromBand(avg, min, max, params, expected) {
  const mn = num(min, 0);
  const mx = num(max, mn);
  const exp = Number.isFinite(num(expected, NaN)) ? num(expected, NaN) : (mn + mx) / 2;
  const deltaUp = safeDivisor(params.baseDeltaUp);
  const deltaDown = safeDivisor(params.baseDeltaDown);
  const delta = avg >= exp ? deltaUp : deltaDown;
  const slope = 50 / delta;
  return 50 + slope * (avg - exp);
}

function calcBonus(score, handicap, base, params) {
  const margin = num(score, 0) - num(handicap, 0);
  const marginPlus = Math.max(0, margin);

  const M = safeDivisor(params.M);
  const bonusRaw = num(params.Bmax, 0) * (1 - Math.exp(-marginPlus / M));

  const factor = 0.2 + 0.8 * clamp01((85 - base) / 35);
  const bonus = factor * bonusRaw;

  return { margin, marginPlus, bonusRaw, factor, bonus };
}

function calcPenalty(score, handicap, avg, min, max, params) {
  const mn = num(min, 0);
  const mx = num(max, mn);
  const bandWidth = Math.max(mx - mn, 1e-9);

  const short = Math.max(0, num(handicap, 0) - num(score, 0));
  const below = clamp01((mn - avg) / bandWidth);

  // ✅ 감점 제거: penalty는 항상 0
  const penalty = 0;

  return { short, below, penalty };
}

function rateGame({ score, inning, handicap, band, params }) {
  const p = { ...DEFAULT_PARAMS, ...(params || {}) };

  const avg = calcAvg(score, inning);
  const min = num(band?.min, 0);
  const max = num(band?.max, min);

  const base = calcBaseFromBand(avg, min, max, p, band?.expected);
  const { margin, marginPlus, bonusRaw, factor, bonus } = calcBonus(score, handicap, base, p);
  const { short, below, penalty } = calcPenalty(score, handicap, avg, min, max, p);

  const ratingRaw = base + bonus - penalty;
  const ratingClamped = clamp(ratingRaw, 0, 100);
  const rating = ratingRaw;

  return {
    avg: round(avg, 3),
    base: round(base, 1),
    margin: round(margin, 1),
    bonusRaw: round(bonusRaw, 1),
    factor: round(factor, 3),
    bonus: round(bonus, 1),
    short: round(short, 1),
    below: round(below, 3),
    penalty: round(penalty, 1),
    ratingRaw: round(ratingRaw, 1),
    ratingClamped: round(ratingClamped, 1),
    rating: round(rating, 1),
    scoringParams: p,
  };
}

module.exports = {
  DEFAULT_PARAMS,
  clamp01,
  calcAvg,
  calcBaseFromBand,
  calcBonus,
  calcPenalty,
  rateGame,
};
