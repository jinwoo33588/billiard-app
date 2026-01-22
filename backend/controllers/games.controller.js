/**
 * games.controller.js
 * - routes에서 넘어온 req/res를 받아 처리한다.
 * - 쿼리 파라미터(limit)를 읽고, service를 호출한 뒤 JSON 응답한다.
 */

const gamesService = require("../services/games.service");
const httpError = require("../utils/httpError");
const { validateCreateGame, validateGameId, validateUpdateGame } = require("../validators/games.validator");

async function listMyGames(req, res) {
  // GET /api/games?limit=20
  const limitRaw = req.query.limit;
  const limit = limitRaw ? Number(limitRaw) : undefined;

  if (limitRaw !== undefined && !Number.isFinite(limit)) {
    throw httpError(400, "limit must be a number");
  }

  const docs = await gamesService.listMyGames(req.user.userId, { limit });
  res.json(docs.map((d) => d.toPublic()));
}

async function createMyGame(req, res) {
  const payload = validateCreateGame(req.body);
  const doc = await gamesService.createMyGame(req.user.userId, payload);
  res.status(201).json(doc.toPublic());
}

async function getMyGame(req, res) {
  const gameId = validateGameId(req.params.id);
  const doc = await gamesService.getMyGame(req.user.userId, gameId);
  res.json(doc.toPublic());
}

async function updateMyGame(req, res) {
  const gameId = validateGameId(req.params.id);
  const patch = validateUpdateGame(req.body);
  const doc = await gamesService.updateMyGame(req.user.userId, gameId, patch);
  res.json(doc.toPublic());
}

async function deleteMyGame(req, res) {
  const gameId = validateGameId(req.params.id);
  const doc = await gamesService.deleteMyGame(req.user.userId, gameId);
  res.json({ ok: true, id: doc._id.toString() });
}

module.exports = {
  listMyGames,
  createMyGame,
  getMyGame,
  updateMyGame,
  deleteMyGame,
};