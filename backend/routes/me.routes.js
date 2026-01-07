// backend/routes/me.routes.js
const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/auth');

const usersService = require('../services/users/users.service');
const gamesService = require('../services/games/games.service');
const insightsService = require('../services/insights/insights.service');
const statsService = require('../services/stats/stats.service'); 
const monthlyStatsService = require('../services/stats/stats.monthly');

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

router.use(authMiddleware);

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
    const game = await gamesService.createGame(req.user.userId, payload);
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
    const game = await gamesService.updateMyGame(req.user.userId, gameId, payload);
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
    await gamesService.deleteMyGame(req.user.userId, gameId);
    res.json({ message: '경기가 성공적으로 삭제되었습니다.' });
  })
);

// ✅ 내 인사이트
router.get(
  '/insights',
  asyncHandler(async (req, res) => {
    const windowSize = validateWindow(req.query.window);
    const data = await insightsService.getInsightsForUser(req.user.userId, windowSize);
    res.json(data);
  })
);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const { type = 'all' } = req.query;

    // -----------------------
    // 1️⃣ selector 구성
    // -----------------------
    let selector;

    switch (type) {
      case 'lastN':
        selector = {
          type: 'lastN',
          n: clamp(toInt(req.query.n, 10), 1, 2000),
        };
        break;

      case 'range':
        selector = {
          type: 'range',
          from: toDate(req.query.from),
          to: toDate(req.query.to),
        };
        break;

      case 'thisMonth':
        selector = {
          type: 'thisMonth',
          now: req.query.now ? toDate(req.query.now) : undefined,
        };
        break;

      case 'yearMonth':
        selector = {
          type: 'yearMonth',
          year: toInt(req.query.year),
          month: toInt(req.query.month),
        };
        break;

      case 'all':
      default:
        selector = { type: 'all' };
        break;
    }

    // -----------------------
    // 2️⃣ pick 처리
    // pick=counts&pick=avg 형태
    // -----------------------
    let pick = req.query.pick;
    if (typeof pick === 'string') pick = [pick];
    if (!Array.isArray(pick)) pick = undefined;

    // -----------------------
    // 3️⃣ stats 서비스 호출
    // -----------------------
    const data = await statsService.buildStatsForUser(req.user.userId, {
      selector,
      pick,
    });

    res.json(data);
  })
);



router.get(
  '/stats/monthly',
  asyncHandler(async (req, res) => {
    const { type = 'all' } = req.query;

    // selector 파싱 로직은 /stats랑 동일
    let selector;
    switch (type) {
      case 'lastN':
        selector = { type: 'lastN', n: clamp(toInt(req.query.n), 1, 2000) };
        break;
      case 'range':
        selector = { type: 'range', from: toDate(req.query.from), to: toDate(req.query.to) };
        break;
      case 'thisMonth':
        selector = { type: 'thisMonth', now: req.query.now ? toDate(req.query.now) : undefined };
        break;
      case 'yearMonth':
        selector = { type: 'yearMonth', year: toInt(req.query.year), month: toInt(req.query.month) };
        break;
      case 'all':
      default:
        selector = { type: 'all' };
        break;
    }

    const data = await monthlyStatsService.buildMonthlyStatsForUser(
      req.user.userId,
      { selector }
    );

    res.json(data);
  })
);

module.exports = router;