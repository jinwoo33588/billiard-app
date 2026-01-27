/**
 * games.service.js
 * - ✅ controller는 그대로(toPublic 호출 유지)
 * - service는 Game Document를 반환하고,
 * - handicap/rating은 doc.$locals.extra에 붙인다 (DB 저장 X)
 */

const Game = require("../models/Game");
const User = require("../models/User");
const httpErrorMod = require("../utils/httpError");
const { buildDateRange } = require("../utils/date");

const { lookupHandicapBenchmark } = require("./insights/handicap.lookup");
const { rateGame } = require("./ratings/rating.scoring");

/** httpError 모듈 형태가 프로젝트마다 달라서(함수/클래스) 안전하게 래핑 */
function httpError(status, message) {
  if (typeof httpErrorMod === "function") return httpErrorMod(status, message);
  if (httpErrorMod?.HttpError) return new httpErrorMod.HttpError(status, message);
  const e = new Error(message);
  e.status = status;
  return e;
}

/** user handicap 1회 조회 */
async function getUserHandicap(userId) {
  const u = await User.findById(userId).select("handicap");
  if (!u) throw httpError(404, "user not found");

  const h = Number(u.handicap);
  return Number.isFinite(h) ? h : 0;
}

/** doc에 extra(=handicap/rating 등) 붙이기 */
function attachExtraToDoc(doc, handicap) {
  if (!doc) return doc;

  const bm = lookupHandicapBenchmark(handicap);

  const scored = rateGame({
    score: doc.score,
    inning: doc.inning,
    expected: bm.expected,
    handicap,
  });

  // ✅ DB 저장 X, 응답용 임시 필드
  doc.$locals = doc.$locals || {};
  doc.$locals.extra = {
    handicapUsed: handicap,
    expectedAvg: bm.expected,

    rating: scored.rating,
    // effRating: scored.effRating,
    // volRating: scored.volRating,

    // 원하면 제거 가능 (프론트 디버깅/설명용)
    avg: scored.avg,
    // eff: scored.eff,
    // vol: scored.vol,
  };

  return doc;
}

async function listMyGames(userId, { limit, from, to } = {}) {
  const find = { userId };

  const range = buildDateRange(from, to);
  if (range) find.gameDate = range;

  const q = Game.find(find).sort({ gameDate: -1, updatedAt: -1 });
  if (typeof limit === "number" && limit > 0) q.limit(limit);

  const docs = await q;

  // ✅ handicap/benchmark는 1번만
  const handicap = await getUserHandicap(userId);

  // ✅ docs는 Document 그대로 유지
  return docs.map((d) => attachExtraToDoc(d, handicap));
}

async function createMyGame(userId, payload) {
  const doc = await Game.create({ ...payload, userId });
  const handicap = await getUserHandicap(userId);
  return attachExtraToDoc(doc, handicap);
}

async function getMyGame(userId, gameId) {
  const doc = await Game.findOne({ _id: gameId, userId });
  if (!doc) throw httpError(404, "game not found");

  const handicap = await getUserHandicap(userId);
  return attachExtraToDoc(doc, handicap);
}

async function updateMyGame(userId, gameId, patch) {
  const doc = await Game.findOneAndUpdate(
    { _id: gameId, userId },
    { $set: patch },
    { new: true }
  );
  if (!doc) throw httpError(404, "game not found");

  const handicap = await getUserHandicap(userId);
  return attachExtraToDoc(doc, handicap);
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