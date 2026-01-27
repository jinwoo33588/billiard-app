// backend/utils/num.js
// - 숫자 계산에 필요한 공용 유틸(서비스/도메인 공통)

function num(v, fallback = 0) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(v, lo, hi) {
  const x = num(v, lo);
  return Math.min(hi, Math.max(lo, x));
}

function round(v, digits = 0) {
  const x = num(v, 0);
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
}

module.exports = { num, clamp, round };