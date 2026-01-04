// src/features/games/label.ts
import type { Game } from "./types";

/** DB는 WIN/DRAW/LOSE/UNKNOWN, 화면은 한글 */
export function resultLabel(r: Game["result"]) {
  switch (r) {
    case "WIN":
      return "승";
    case "DRAW":
      return "무";
    case "LOSE":
      return "패";
    default:
      return "-";
  }
}

/** UI 색상도 DB값 기준으로 */
export function resultColor(r: Game["result"]) {
  switch (r) {
    case "WIN":
      return "blue";
    case "DRAW":
      return "gray";
    case "LOSE":
      return "red";
    default:
      return "gray";
  }
}

export function gameTypeLabel(t: Game["gameType"]) {
  return t === "UNKNOWN" ? "-" : t;
}