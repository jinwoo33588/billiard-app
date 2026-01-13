// backend/services/games/games.service.js
const gamesRepo = require("./games.repo");
const { ensureFound } = require("./games.policy");

// ✅ 봉인: 쓰기는 무조건 statsWrite로
const statsWrite = require("../stats/stats.write");

async function listMyGames(userId, opts = {}) {
  const { limit, range } = opts;

  if (limit) return gamesRepo.findRecentMyGames(userId, limit);
  if (range?.start || range?.end) return gamesRepo.findMyGamesInRange(userId, range.start, range.end);
  return gamesRepo.findMyGames(userId);
}

// ✅ create/update/delete는 이제 “statsWrite로만”
async function createGame(userId, payload) {
  return await statsWrite.createGameAndUpdateStats(userId, payload);
}

async function updateMyGame(userId, gameId, payload) {
  const updated = await statsWrite.updateGameAndUpdateStats(userId, gameId, payload);
  return ensureFound(updated);
}

async function deleteMyGame(userId, gameId) {
  const old = await statsWrite.deleteGameAndUpdateStats(userId, gameId);
  ensureFound(old, "해당 기록을 찾을 수 없거나 삭제할 권한이 없습니다.");
  return true;
}

async function listUserGamesPublic(userId) {
  return await gamesRepo.findUserGamesPublic(userId);
}

module.exports = {
  listMyGames,
  createGame,
  updateMyGame,
  deleteMyGame,
  listUserGamesPublic,
};