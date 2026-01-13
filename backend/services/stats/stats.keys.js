// backend/services/stats/stats.keys.js
function pad2(n) {
  return String(n).padStart(2, "0");
}

function dayKeyOf(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`;
}

function monthKeyOf(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}`;
}

function dayStart(d) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate(), 0, 0, 0, 0);
}

function ymOf(d) {
  const x = new Date(d);
  return { year: x.getFullYear(), month: x.getMonth() + 1 };
}

function round(n, d) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

module.exports = { pad2, dayKeyOf, monthKeyOf, dayStart, ymOf, round };