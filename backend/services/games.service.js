/**
 * games.service.js
 * - DB(Game 모델)에 접근해서 "내 게임 목록"을 가져온다.
 * - 라우터는 HTTP 처리, 서비스는 DB 조회 로직만 담당한다.
 */

const Game = require("../models/Game");
const httpError = require("../utils/httpError");

// 	“내 userId”로만 Game을 찾고, 최신순으로 정렬해서 반환.limit 있으면 N개만
async function listMyGames(userId, { limit } = {}) {
  const q = Game.find({ userId }).sort({ gameDate: -1, updatedAt: -1 });

  // limit이 있으면 제한 (숫자가 아니면 무시하거나 라우터에서 검증)
  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    q.limit(limit);
  }

  return await q;
}

async function createMyGame(userId, payload) {
  const doc = await Game.create({ ...payload, userId });
  return doc;
}

async function getMyGame(userId, gameId) {
  const doc = await Game.findOne({ _id: gameId, userId });
  if (!doc) throw httpError(404, "game not found");
  return doc;
}

async function updateMyGame(userId, gameId, patch) {
  const doc = await Game.findOneAndUpdate(
    { _id: gameId, userId },
    { $set: patch },
    { new: true }
  );
  if (!doc) throw httpError(404, "game not found");
  return doc;
}

async function deleteMyGame(userId, gameId) {
  const doc = await Game.findOneAndDelete({ _id: gameId, userId });
  if (!doc) throw httpError(404, "game not found");
  return doc;
}

module.exports = {
  listMyGames,
  createMyGame,
  getMyGame,
  updateMyGame,
  deleteMyGame,
};