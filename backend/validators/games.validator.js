/**
 * games.validator.js
 * - POST /api/games 요청 바디를 검증하고, 저장 가능한 payload로 정리한다.
 * - 잘못된 입력은 400 에러로 막는다.
 */
const mongoose = require("mongoose");
const httpError = require("../utils/httpError");

const GAME_RESULTS = ["WIN", "DRAW", "LOSE", "UNKNOWN"];
const GAME_TYPES = ["UNKNOWN", "1v1", "2v2", "2v2v2", "3v3", "3v3v3"];

function isFiniteNumber(v) {
  return typeof v === "number" && Number.isFinite(v);
}

function parseDateOrThrow(v) {
  // 허용: ISO string / YYYY-MM-DD / Date
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) {
    throw httpError(400, "gameDate is invalid");
  }
  return d;
}

function validateCreateGame(body) {
  const { score, inning, result, gameType, gameDate, memo } = body;

  if (!isFiniteNumber(score) || score < 0) {
    throw httpError(400, "score must be a number >= 0");
  }

  if (!isFiniteNumber(inning) || inning < 1) {
    throw httpError(400, "inning must be a number >= 1");
  }

  if (typeof result !== "string" || !GAME_RESULTS.includes(result)) {
    throw httpError(400, `result must be one of: ${GAME_RESULTS.join(", ")}`);
  }

  if (typeof gameType !== "string" || !GAME_TYPES.includes(gameType)) {
    throw httpError(400, `gameType must be one of: ${GAME_TYPES.join(", ")}`);
  }

  const parsedDate = parseDateOrThrow(gameDate);

  if (memo !== undefined && typeof memo !== "string") {
    throw httpError(400, "memo must be a string");
  }

  if (typeof memo === "string" && memo.length > 500) {
    throw httpError(400, "memo must be <= 500 chars");
  }

  return {
    score,
    inning,
    result,
    gameType,
    gameDate: parsedDate,
    memo: typeof memo === "string" ? memo : "",
  };
}

function validateGameId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw httpError(400, "invalid game id");
  }
  return id;
}

// PUT은 "부분 수정(patch)" 허용
function validateUpdateGame(body) {
  const patch = {};

  if (body.score !== undefined) {
    if (typeof body.score !== "number" || !Number.isFinite(body.score) || body.score < 0) {
      throw httpError(400, "score must be a number >= 0");
    }
    patch.score = body.score;
  }

  if (body.inning !== undefined) {
    if (typeof body.inning !== "number" || !Number.isFinite(body.inning) || body.inning < 1) {
      throw httpError(400, "inning must be a number >= 1");
    }
    patch.inning = body.inning;
  }

  if (body.result !== undefined) {
    if (typeof body.result !== "string" || !GAME_RESULTS.includes(body.result)) {
      throw httpError(400, `result must be one of: ${GAME_RESULTS.join(", ")}`);
    }
    patch.result = body.result;
  }

  if (body.gameType !== undefined) {
    if (typeof body.gameType !== "string" || !GAME_TYPES.includes(body.gameType)) {
      throw httpError(400, `gameType must be one of: ${GAME_TYPES.join(", ")}`);
    }
    patch.gameType = body.gameType;
  }

  if (body.gameDate !== undefined) {
    const d = new Date(body.gameDate);
    if (Number.isNaN(d.getTime())) {
      throw httpError(400, "gameDate is invalid");
    }
    patch.gameDate = d;
  }

  if (body.memo !== undefined) {
    if (typeof body.memo !== "string") {
      throw httpError(400, "memo must be a string");
    }
    if (body.memo.length > 500) {
      throw httpError(400, "memo must be <= 500 chars");
    }
    patch.memo = body.memo;
  }

  // 아무 것도 안 보냈을 때 방지(선택)
  if (Object.keys(patch).length === 0) {
    throw httpError(400, "no updatable fields provided");
  }

  return patch;
}


module.exports = {
  validateCreateGame,
  validateGameId,
  validateUpdateGame,
  GAME_RESULTS,
  GAME_TYPES,
};