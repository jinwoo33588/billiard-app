import { isFiniteNumber } from "./number";

export function calcAvg(score: number | null | undefined, inning: number | null | undefined): number | null {
  if (!isFiniteNumber(score) || !isFiniteNumber(inning) || inning <= 0) return null;
  return score / inning;
}
