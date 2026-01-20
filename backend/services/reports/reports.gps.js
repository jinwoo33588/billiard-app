// backend/services/reports/reports.gps.js

/** ====== 튜닝 상수(파일 내부 고정) ====== */
const R_EFF = 0.15;
const P_EFF = 2.4;

const R_VOL = 2.0;
const P_VOL = 2.4;

const SOFTMAX_K = 0.05;

/** ====== helpers ====== */
function num(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function clamp(x, lo, hi) {
  const n = num(x, 0);
  return Math.min(hi, Math.max(lo, n));
}

function round(n, d = 0) {
  const x = num(n, 0);
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

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
function effScore(eff) {
  const e = num(eff, 0);
  const sgn = e > 0 ? 1 : e < 0 ? -1 : 0;

  const R = Math.max(1e-9, R_EFF);
  const x = Math.abs(e) / R;
  const f = Math.min(1, Math.pow(x, P_EFF));

  const score = 50 + 50 * sgn * f;
  return clamp(score, 0, 100);
}

function volScore(vol) {
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
 * gps 계산 (eff, vol 입력 버전)
 * - eff/vol 중 "더 잘 나온 쪽"에 가중치가 더 가도록 softmax
 */
function gpsScore(eff, vol) {
  const es = effScore(eff);
  const vs = volScore(vol);

  const { wA: wEff, wB: wVol } = softmaxWeights2(es, vs);
  const gps = num(es, 0) * wEff + num(vs, 0) * wVol;

  return {
    gps: round(gps, 1),
    // effScore: round(es, 1),
    // volScore: round(vs, 1),
    // weights: {
    //   eff: round(wEff, 3),
    //   vol: round(wVol, 3),
    //   k: SOFTMAX_K,
    // },
  };
}

/**
 * ✅ 게임 + expected + handicap -> gps 평가
 */
function gpsFromGame({ score, inning }, { expected }, handicap) {
  const avg = calcAvg(score, inning);
  const eff = calcEff(avg, expected);
  const vol = calcVol(score, handicap, inning);

  return {
    raw: {
      avg: round(avg, 3),
      expected: round(expected, 3),
      // eff: round(eff, 3),
      // vol: round(vol, 3),
    },
    ...gpsScore(eff, vol),
  };
}

module.exports = {
  gpsFromGame,
  // export(선택)
  // calcAvg,
  // calcEff,
  // calcVol,
  // effScore,
  // volScore,
  // gpsScore,
};
