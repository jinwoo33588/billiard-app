// backend/routes/me.routes.js
const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/auth');

const usersService = require('../services/users/users.service');
const gamesService = require('../services/games/games.service');
const insightsService = require('../services/insights/insights.service');

const statsRead = require('../services/stats/stats.read');
const statsWrite = require('../services/stats/stats.write');

const {
  isObjectId,
  validateWindow,
  validateGameCreate,
  validateGameUpdate,
  validateUpdateMe,
  validateStatsQuery, 
  clamp, 
  toInt, 
  toDate,
} = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);         // 여기서부터 아래는 전부 req.user 보장

// ✅ 내 프로필
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const data = await usersService.getMe(req.user.userId);
    res.json(data);
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const payload = validateUpdateMe(req.body);
    const data = await usersService.updateMe(req.user.userId, payload);
    res.json(data);
  })
);

// ✅ 내 게임 목록
router.get('/games', asyncHandler(async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  const games = await gamesService.listMyGames(req.user.userId, { limit });
  res.json(games);
}));

// ✅ 내 게임 추가
router.post(
  '/games',
  asyncHandler(async (req, res) => {
    const payload = validateGameCreate(req.body);

    // ⛳️ DB insert + stats 집계 업데이트 (트랜잭션)
    const game = await statsWrite.createGameAndUpdateStats(req.user.userId, payload);

    res.status(201).json({ message: '경기가 성공적으로 기록되었습니다.', game });
  })
);

// ✅ 내 게임 수정
router.put(
  '/games/:gameId',
  asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    if (!isObjectId(gameId)) {
      const e = new Error('gameId가 올바르지 않습니다.');
      e.status = 400;
      throw e;
    }

    const payload = validateGameUpdate(req.body);

    const game = await statsWrite.updateGameAndUpdateStats(req.user.userId, gameId, payload);
    if (!game) {
      const e = new Error('해당 기록을 찾을 수 없거나 수정할 권한이 없습니다.');
      e.status = 404;
      throw e;
    }

    res.json({ message: '경기가 성공적으로 수정되었습니다.', game });
  })
);

// ✅ 내 게임 삭제
router.delete(
  '/games/:gameId',
  asyncHandler(async (req, res) => {
    const { gameId } = req.params;
    if (!isObjectId(gameId)) {
      const e = new Error('gameId가 올바르지 않습니다.');
      e.status = 400;
      throw e;
    }

    const old = await statsWrite.deleteGameAndUpdateStats(req.user.userId, gameId);
    if (!old) {
      const e = new Error('해당 기록을 찾을 수 없거나 삭제할 권한이 없습니다.');
      e.status = 404;
      throw e;
    }

    res.json({ message: '경기가 성공적으로 삭제되었습니다.' });
  })
);

// ✅ 내 인사이트
router.get('/insights', asyncHandler(async (req, res) => {
  const windowSize = validateWindow(req.query.window);
  const data = await insightsService.getInsightsForUser(req.user.userId, windowSize);
  res.json(data);
}));

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const { type = 'all' } = req.query;

    if (type === 'all') {
      const debug = req.query.debug === "1";
      const data = await statsRead.getAllStats(req.user.userId);
      return res.json(data);
    }

    if (type === 'range') {
      const from = toDate(req.query.from);
      const to = toDate(req.query.to);
      const data = await statsRead.getRangeStats(req.user.userId, from, to);
      return res.json(data);
    }

    if (type === 'thisMonth') {
      const now = req.query.now ? toDate(req.query.now) : new Date();
      return res.json(await statsRead.getThisMonthStats(req.user.userId, now));
    }
  
    if (type === 'yearMonth') {
      return res.json(await statsRead.getYearMonthStats(req.user.userId, req.query.year, req.query.month));
    }
  
    if (type === 'lastN') {
      const n = clamp(toInt(req.query.n, 10), 1, 2000);
      const data = await statsRead.getLastNStats(req.user.userId, n);
      return res.json(data);
    }
  
    const e = new Error(`현재 미리집계(stats) 방식에서는 type=${type}를 지원하지 않습니다. (all/range만 지원)`);
    e.status = 400;
    throw e;
  })
);

router.get(
  '/stats/monthly',
  asyncHandler(async (req, res) => {
    // 옵션: fromMonthKey=2025-01&toMonthKey=2026-01
    const { fromMonthKey, toMonthKey } = req.query;

    const data = await statsRead.getMonthlySeries(req.user.userId, fromMonthKey, toMonthKey);

    res.json(data);
  })
);

module.exports = router;