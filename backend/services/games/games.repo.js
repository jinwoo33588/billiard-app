const Game = require('../../models/Game');

function findMyGames(userId) {
  return Game.find({ userId }).sort({ gameDate: -1 });
}

function findRecentMyGames(userId, limit) {
  return Game.find({ userId })
    .sort({ gameDate: -1 })
    .limit(limit);
}

function findMyGamesInRange(userId, start, end) {
  const q = { userId };
  if (start || end) {
    q.gameDate = {};
    if (start) q.gameDate.$gte = start;
    if (end) q.gameDate.$lte = end;
  }
  return Game.find(q).sort({ gameDate: -1 });
}

function createGame(userId, payload) {
  return Game.create({ userId, ...payload });
}

function updateMyGame(userId, gameId, payload) {
  return Game.findOneAndUpdate(
    { _id: gameId, userId },
    { $set: payload },
    { new: true }
  );
}

function deleteMyGame(userId, gameId) {
  return Game.findOneAndDelete({ _id: gameId, userId });
}

// 공개 게임 (필요 없으면 routes에서 제거)
function findUserGamesPublic(userId) {
  return Game.find({ userId }).sort({ gameDate: -1 });
}

module.exports = {
  findMyGames,
  findRecentMyGames,
  findMyGamesInRange,
  createGame,
  updateMyGame,
  deleteMyGame,
  findUserGamesPublic,
};