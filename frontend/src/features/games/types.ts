// frontend/src/features/games/types.ts

export type Game = {
  _id: string;
  userId: string;
  score: number;
  inning: number;
  result: "WIN" | "DRAW" | "LOSE" | "UNKNOWN";
  gameType: "UNKNOWN" | "1v1" | "2v2" | "2v2v2" | "3v3" | "3v3v3";
  gameDate: string; // ISO
  memo?: string;
};