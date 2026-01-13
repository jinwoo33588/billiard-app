// backend/services/insights/insights.utils.js
function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(x, a, b) {
  const n = num(x, a);
  return Math.max(a, Math.min(b, n));
}

function round(n, d = 3) {
  const x = num(n, 0);
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function monthKeyOf(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}`;
}

module.exports = { num, clamp, round, monthKeyOf };