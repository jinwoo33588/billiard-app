// backend/services/games/games.validators.js
const {
  badRequest,
  parseOptionalInt,
  parseRequiredNumber,
  parseOptionalString,
  parseEnum,
  parseOptionalDateOnlyKst,
  parseRequiredDate,
  parseOptionalSort,
  validateFromTo,
} = require('../../utils/validators');

const { GAME_RESULTS, GAME_TYPES } = require('../../constants/game.enums');

function parseGameListQuery(query) {
  const from = parseOptionalDateOnlyKst(query.from, 'from', { endOfDay: false });
  const to = parseOptionalDateOnlyKst(query.to, 'to', { endOfDay: true });
  validateFromTo(from, to);

  const limit = parseOptionalInt(query.limit, 'limit');
  const sort = parseOptionalSort(query.sort, 'sort');
  const includeGps = query.includeGps === '1';
  

  return { from, to, limit, sort, includeGps };
}

function parseGameCreateBody(body) {
  const score = parseRequiredNumber(body.score, 'score', { min: 0 });
  const inning = parseRequiredNumber(body.inning, 'inning', { min: 1 });
  const gameDate = parseRequiredDate(body.gameDate, 'gameDate');

  const result = parseEnum(body.result, 'result', GAME_RESULTS, 'UNKNOWN');
  const gameType = parseEnum(body.gameType, 'gameType', GAME_TYPES, 'UNKNOWN');
  const memo = parseOptionalString(body.memo, 'memo', { trim: true, maxLen: 500 });

  return { score, inning, gameDate, result, gameType, memo };
}

function parseGameUpdateBody(body) {
  const upd = {};

  if (body.score !== undefined) upd.score = parseRequiredNumber(body.score, 'score', { min: 0 });
  if (body.inning !== undefined) upd.inning = parseRequiredNumber(body.inning, 'inning', { min: 1 });
  if (body.gameDate !== undefined) upd.gameDate = parseRequiredDate(body.gameDate, 'gameDate');
  if (body.result !== undefined) upd.result = parseEnum(body.result, 'result', GAME_RESULTS, 'UNKNOWN');
  if (body.gameType !== undefined) upd.gameType = parseEnum(body.gameType, 'gameType', GAME_TYPES, 'UNKNOWN');
  if (body.memo !== undefined) upd.memo = parseOptionalString(body.memo, 'memo', { trim: true, maxLen: 500 });

  if (Object.keys(upd).length === 0) badRequest('업데이트할 필드가 없습니다.');
  return upd;
}

module.exports = {
  parseGameListQuery,
  parseGameCreateBody,
  parseGameUpdateBody,
};
