// backend/services/ratings/rating.scoring.js
const { clamp, round, num } = require("../../utils/num");

/**
 * Per-game Rating (0~100)
 * - effRating: eff(avg - expected)를 "중앙 둔감 / 꼬리 민감"으로 0~100 변환
 * - volRating: vol((score - handicap)/sqrt(inning))을 "중앙 둔감 / 꼬리 민감"으로 0~100 변환
 * - rating: eff/vol 중 더 잘 나온 쪽에 softmax로 가중치
 */

/** ====== 튜닝 상수(파일 내부 고정) ====== */
const R_EFF = 0.15;
const P_EFF = 2.4;

const R_VOL = 2.0;
const P_VOL = 2.4;

const SOFTMAX_K = 0.05;

/** ---------- raw feature builders ---------- */
function calcAvg(score, inning) {
  const s = num(score, 0);
  const inn = Math.max(1, num(inning, 1));
  return s / inn;
}

function calcEff(avg, expected) {
  return num(avg, 0) - num(expected, 0);
}

function calcVol(score, handicap, inning) {
  const volRaw = num(score, 0) - num(handicap, 0);
  const inn = Math.max(1, num(inning, 1));
  return volRaw / Math.sqrt(inn);
}

/** ---------- 0~100 scoring (central-insensitive, tail-sensitive) ---------- */
function effRatingScore(eff) {
  const e = num(eff, 0);
  const sgn = e > 0 ? 1 : e < 0 ? -1 : 0;

  const R = Math.max(1e-9, R_EFF);
  const x = Math.abs(e) / R;
  const f = Math.min(1, Math.pow(x, P_EFF));

  const score = 50 + 50 * sgn * f;
  return clamp(score, 0, 100);
}

function volRatingScore(vol) {
  const v = num(vol, 0);
  const sgn = v > 0 ? 1 : v < 0 ? -1 : 0;

  const R = Math.max(1e-9, R_VOL);
  const x = Math.abs(v) / R;
  const f = Math.min(1, Math.pow(x, P_VOL));

  const score = 50 + 50 * sgn * f;
  return clamp(score, 0, 100);
}

/** ---------- softmax weighting ---------- */
function softmaxWeights2(aScore, bScore) {
  const s1 = SOFTMAX_K * num(aScore, 0);
  const s2 = SOFTMAX_K * num(bScore, 0);

  const m = Math.max(s1, s2);
  const ea = Math.exp(s1 - m);
  const eb = Math.exp(s2 - m);
  const sum = ea + eb;

  if (!Number.isFinite(sum) || sum <= 0) {
    return { wA: 0.5, wB: 0.5 };
  }
  return { wA: ea / sum, wB: eb / sum };
}

/**
 * rating 계산 (eff, vol 입력 버전)
 * - eff/vol 중 "더 잘 나온 쪽"에 가중치가 더 가도록 softmax
 */
function ratingScore(eff, vol) {
  const es = effRatingScore(eff); // 0~100
  const vs = volRatingScore(vol); // 0~100

  const { wA: wEff, wB: wVol } = softmaxWeights2(es, vs);
  const rating = num(es, 0) * wEff + num(vs, 0) * wVol;

  return {
    rating: round(rating, 1),
    effRating: round(es, 1),
    volRating: round(vs, 1),
    weights: {
      eff: round(wEff, 3),
      vol: round(wVol, 3),
      k: SOFTMAX_K,
    },
  };
}

/**
 * rateGame (한 판 조립)
 * - 입력: { score, inning, expected, handicap }
 * - 출력: avg/eff/vol + rating 패키지
 */
function rateGame({ score, inning, expected, handicap }) {
  const avg = calcAvg(score, inning);
  const eff = calcEff(avg, expected);
  const vol = calcVol(score, handicap, inning);

  const pack = ratingScore(eff, vol);

  return {
    avg: round(avg, 3),
    eff: round(eff, 3),
    vol: round(vol, 3),

    ...pack,

    scoringParams: {
      R_EFF,
      P_EFF,
      R_VOL,
      P_VOL,
      SOFTMAX_K,
    },
  };
}

module.exports = {
  R_EFF,
  P_EFF,
  R_VOL,
  P_VOL,
  SOFTMAX_K,

  calcAvg,
  calcEff,
  calcVol,

  effRatingScore,
  volRatingScore,

  softmaxWeights2,
  ratingScore,

  rateGame,
};