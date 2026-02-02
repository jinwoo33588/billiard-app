export type GameResult = "WIN" | "DRAW" | "LOSE" | "UNKNOWN";
export type GameType = "UNKNOWN" | "1v1" | "2v2" | "2v2v2" | "3v3" | "3v3v3";

export type Game = {
  id: string;
  userId: string;

  score: number;
  inning: number;

  result: GameResult;
  gameType: GameType;

  gameDate: string; // ISO string
  memo: string;

  createdAt?: string;
  updatedAt?: string;

  // ✅ 서버에서 계산해서 내려오는 extra 필드들 (없을 수도 있음)
  rating?: number;
  ratingRaw?: number;
  ratingClamped?: number;
  expectedAvg?: number;
  handicapUsed?: number;
  handicapAtGame?: number;
  avg?: number;
};

// 생성 요청 바디(프론트 -> 백엔드)
export type CreateGamePayload = {
  score: number;
  inning: number;
  result: GameResult;
  gameType: GameType;
  gameDate: string; // ISO string or YYYY-MM-DD
  memo?: string;
};

// 수정 요청 바디(PUT patch)
export type UpdateGamePayload = Partial<Pick<Game, "score" | "inning" | "result" | "gameType" | "gameDate" | "memo">>;
