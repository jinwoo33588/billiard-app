// frontend/src/utils/date.ts
export function toIso(input: unknown): string {
  if (input instanceof Date) return input.toISOString();
  if (typeof input === "string") {
    const d = new Date(input);
    if (!Number.isFinite(d.getTime())) {
      throw new Error("Invalid date string");
    }
    return d.toISOString();
  }
  throw new Error("gameDate is missing or invalid");
}