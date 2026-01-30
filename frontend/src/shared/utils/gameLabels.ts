import type { Game } from "../../features/games/types";

export function getGameTypeLabel(t: Game["gameType"]) {
  if (t === "1v1") return "1:1";
  if (t === "2v2") return "2:2";
  if (t === "2v2v2") return "2:2:2";
  if (t === "3v3") return "3:3";
  if (t === "3v3v3") return "3:3:3";
  return "기타";
}

export function getGameResultLabel(r: Game["result"]) {
  if (r === "WIN") return "승";
  if (r === "LOSE") return "패";
  if (r === "DRAW") return "무";
  return "기타";
}

export function getGameResultTone(r: Game["result"]) {
  if (r === "WIN") {
    return {
      accent: "#1b73e0",
      badgeBg: "#0573f0",
      badgeText: "#ffffff",
      badgeBorder: "rgba(115, 183, 255, 0.55)",
      badgeShadow: "rgba(115, 183, 255, 0.3)",
      mantineColor: "blue" as const,
    };
  }
  if (r === "LOSE") {
    return {
      accent: "#ff98ad",
      badgeBg: "#ff5d88",
      badgeText: "#ffffff",
      badgeBorder: "rgba(255, 143, 176, 0.55)",
      badgeShadow: "rgba(255, 143, 176, 0.3)",
      mantineColor: "red" as const,
    };
  }
  if (r === "DRAW") {
    return {
      accent: "#c3cbe0",
      badgeBg: "#d6ddee",
      badgeText: "#ffffff",
      badgeBorder: "rgba(199, 208, 232, 0.65)",
      badgeShadow: "rgba(199, 208, 232, 0.3)",
      mantineColor: "gray" as const,
    };
  }
  return {
    accent: "#c3cbe0",
    badgeBg: "#d6ddee",
    badgeText: "#ffffff",
    badgeBorder: "rgba(199, 208, 232, 0.65)",
    badgeShadow: "rgba(199, 208, 232, 0.3)",
    mantineColor: "gray" as const,
  };
}
