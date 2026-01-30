export function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

export function fmtFixed(
  n: number | null | undefined,
  digits: number,
  fallback = "-"
): string {
  if (!isFiniteNumber(n)) return fallback;
  return n.toFixed(digits);
}

export function fmt0(n: number | null | undefined, fallback = "-") {
  return fmtFixed(n, 0, fallback);
}

export function fmt1(n: number | null | undefined, fallback = "-") {
  return fmtFixed(n, 1, fallback);
}

export function fmt2(n: number | null | undefined, fallback = "-") {
  return fmtFixed(n, 2, fallback);
}

export function fmt3(n: number | null | undefined, fallback = "-") {
  return fmtFixed(n, 3, fallback);
}

export function fmtPct(n0to1: number | null | undefined, digits = 0, fallback = "-") {
  if (!isFiniteNumber(n0to1)) return fallback;
  return (n0to1 * 100).toFixed(digits);
}

export function fmtInt(n: number | null | undefined, locale = "ko-KR") {
  if (!isFiniteNumber(n)) return "0";
  return new Intl.NumberFormat(locale).format(n);
}
