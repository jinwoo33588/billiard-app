const gamesRepo = require('./games.repo');
const { ensureFound } = require('./games.policy');

async function listMyGames(userId, opts = {}) {
  const { limit, range } = opts;

  if (limit) {
    return gamesRepo.findRecentMyGames(userId, limit);
  }

  if (range?.start || range?.end) {
    return gamesRepo.findMyGamesInRange(userId, range.start, range.end);
  }

  return gamesRepo.findMyGames(userId);
}


async function createGame(userId, payload) {
  return await gamesRepo.createGame(userId, payload);
}

async function updateMyGame(userId, gameId, payload) {
  const updated = await gamesRepo.updateMyGame(userId, gameId, payload);
  return ensureFound(updated);
}

async function deleteMyGame(userId, gameId) {
  const deleted = await gamesRepo.deleteMyGame(userId, gameId);
  ensureFound(deleted, '해당 기록을 찾을 수 없거나 삭제할 권한이 없습니다.');
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