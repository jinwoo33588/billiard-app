// backend/services/games/games.service.js

const gamesRepo = require('./games.repo');
const User = require('../../models/User');
const { evaluateGameGps } = require('../reports/reports.eval');

function notFound(message = '게임을 찾을 수 없습니다.') {
  const e = new Error(message);
  e.status = 404;
  throw e;
}

async function loadUserHandicap(userId) {
  const user = await User.findById(userId).select('handicap').lean();
  if (!user) {
    const e = new Error('사용자를 찾을 수 없습니다.');
    e.status = 404;
    throw e;
  }
  return user;
}

function attachGps(game, user) {
  const { gps } = evaluateGameGps(game, user, { explain: false });
  
  return { ...game, gps };
}



/**
 * ✅ 내 게임 목록
 * - query 파싱/형식 검증은 route + games.validators에서 끝났다고 가정
 * - service는 "정책"만 적용 (limit 상한/기본값 등)
 */

// gps 붙이려면 user 조회가 필요하므로 async로 바꿈(기존은 동기 함수)
async function listMyGames(userId, opts = {}) {
  const from = opts.from;
  const to = opts.to;

  const rawLimit = Number(opts.limit);
  let limit = Number.isFinite(rawLimit) ? rawLimit : 50;
  limit = Math.max(1, limit);
  limit = Math.min(200, limit);

  const sort = opts.sort === 'asc' ? 'asc' : 'desc';

  const games = await gamesRepo.listByUser(userId, { from, to, limit, sort });

  // ✅ 옵션이 없으면 기존처럼 그대로 반환
  if (!opts.includeGps) return games;

  const user = await loadUserHandicap(userId);
  return games.map((g) => attachGps(g, user));
}


/**
 * ✅ 내 게임 생성
 * - body 파싱/검증은 games.validators.parseGameCreateBody에서 끝났다고 가정
 * - userId는 service에서 강제로 주입
 */
async function createMyGame(userId, doc) {
  return gamesRepo.create({ ...doc, userId });
}

/**
 * ✅ 내 게임 단건 조회
 */
async function getMyGame(userId, gameId, opts = {}) {
  const game = await gamesRepo.findByIdAndUser(gameId, userId);
  if (!game) notFound();

  if (!opts.includeGps) return game;

  const user = await loadUserHandicap(userId);
  return attachGps(game, user);
}

/**
 * ✅ 내 게임 수정(부분 업데이트)
 * - upd는 games.validators.parseGameUpdateBody가 만들어준 안전한 payload라고 가정
 */
async function updateMyGame(userId, gameId, upd) {
  const game = await gamesRepo.updateByIdAndUser(gameId, userId, upd);
  if (!game) notFound();
  return game;
}

/**
 * ✅ 내 게임 삭제
 */
async function deleteMyGame(userId, gameId) {
  const game = await gamesRepo.deleteByIdAndUser(gameId, userId);
  if (!game) notFound();
  return; // route에서 204로 응답
}

module.exports = {
  listMyGames,
  createMyGame,
  getMyGame,
  updateMyGame,
  deleteMyGame,
};
