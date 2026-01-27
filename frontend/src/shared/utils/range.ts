export type YmdRange = { from: string; to: string };

export function rangeToQuery(range: YmdRange): { from?: string; to?: string } {
  const from = range?.from?.trim() ?? "";
  const to = range?.to?.trim() ?? "";

  // ✅ 둘 다 있어야만 필터 적용
  if (!from || !to) return {};

  return { from, to };
}