// 공통 수학 유틸

function round(n, d = 2) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

module.exports = { round, clamp };