// frontend/src/features/insights/utils/format.ts
export function fmt(n: unknown, d = 3) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(d) : "-";
}

export function fmt1(n: unknown) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(1) : "-";
}

export function toLocalDateTime(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}