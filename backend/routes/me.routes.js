// backend/routes/me.routes.js
const express = require('express');

const asyncHandler = require('../utils/asyncHandler');
const authMiddleware = require('../middleware/auth');

const usersService = require('../services/users/users.service');
const gamesService = require('../services/games/games.service');
const reportsService = require('../services/reports/reports.service');

const {
  parseGameListQuery,
  parseGameCreateBody,
  parseGameUpdateBody,
} = require('../services/games/games.validators');

const {
  parseOptionalInt,
  parseOptionalDateOnlyKst,
  parseOptionalMonthKeyKst,
  validateFromTo,
} = require('../utils/validators');

const router = express.Router();
router.use(authMiddleware);

// ----------------------
// Profile
// ----------------------
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = await usersService.getMe(req.user.userId);
    res.json(user);
  })
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const payload = {
      nickname: req.body.nickname,
      handicap: req.body.handicap,
    };
    const user = await usersService.updateMe(req.user.userId, payload);
    res.json(user);
  })
);

// ----------------------
// Games
// ----------------------

// 내 게임 목록
router.get(
  '/games',
  asyncHandler(async (req, res) => {
    const opts = parseGameListQuery(req.query);
    const games = await gamesService.listMyGames(req.user.userId, opts);
    res.json(games);
  })
);

// 내 게임 생성
router.post(
  '/games',
  asyncHandler(async (req, res) => {
    const doc = parseGameCreateBody(req.body);
    const game = await gamesService.createMyGame(req.user.userId, doc);
    res.status(201).json(game);
  })
);

// 내 게임 한개 조회
router.get(
  '/games/:id',
  asyncHandler(async (req, res) => {
    const includeGps = req.query.includeGps === '1';
    const game = await gamesService.getMyGame(req.user.userId, req.params.id, { includeGps });
    res.json(game);
  })
);

// 내 게임 수정
router.put(
  '/games/:id',
  asyncHandler(async (req, res) => {
    const upd = parseGameUpdateBody(req.body);
    const game = await gamesService.updateMyGame(req.user.userId, req.params.id, upd);
    res.json(game);
  })
);

// 내 게임 삭제
router.delete(
  '/games/:id',
  asyncHandler(async (req, res) => {
    await gamesService.deleteMyGame(req.user.userId, req.params.id);
    res.status(204).send();
  })
);

// ----------------------
// Reports (파생)
// ----------------------

/**
 * 대시보드 리포트
 * GET /me/reports/dashboard?recent=10
 */
router.get('/reports/dashboard', asyncHandler(async (req, res) => {
  const recent = req.query.recent ? Number(req.query.recent) : 10;
  const months = req.query.months ? Number(req.query.months) : 6;
  const includeRecentGames = req.query.includeRecentGames === '1';
  const includeGps = req.query.includeGps === '1';

  const data = await reportsService.getDashboardReport(req.user.userId, {
    recent,
    months,
    includeRecentGames,
    includeGps,
  });
  res.json(data);
}));


/**
 * 기간 리포트
 * GET /me/reports/range?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
router.get(
  '/reports/range',
  asyncHandler(async (req, res) => {
    const from = parseOptionalDateOnlyKst(req.query.from, 'from', { endOfDay: false });
    const to = parseOptionalDateOnlyKst(req.query.to, 'to', { endOfDay: true });

    if (!from || !to) {
      const e = new Error('from/to가 필요합니다. 예: /me/reports/range?from=2026-01-01&to=2026-01-14');
      e.status = 400;
      throw e;
    }

    validateFromTo(from, to);

    const data = await reportsService.getRangeReport(req.user.userId, { from, to });
    res.json(data);
  })
);

/**
 * 이번 달 리포트
 * GET /me/reports/monthly/current
 */
router.get(
  '/reports/monthly/current',
  asyncHandler(async (req, res) => {
    const data = await reportsService.getCurrentMonthReport(req.user.userId);
    res.json(data);
  })
);

/**
 * 월별 타임라인 (옵션)
 * GET /me/reports/monthly/timeline?from=YYYY-MM&to=YYYY-MM
 *
 * - from/to 없이 호출하면 service에서 기본 범위(예: 최근 24개월 등)로 처리하도록 설계 가능
 */
router.get(
  '/reports/monthly/timeline',
  asyncHandler(async (req, res) => {
    const fromYM = parseOptionalMonthKeyKst(req.query.from, 'from');
    const toYM = parseOptionalMonthKeyKst(req.query.to, 'to');

    // 여기서는 month-key 형태만 검증하고, 범위/기본값 처리(예: 최근 24개월)는 service에서 담당
    const data = await reportsService.getMonthlyTimeline(req.user.userId, { fromYM, toYM });
    res.json(data);
  })
);

/**
 * 단건 게임 평가
 * GET /me/reports/games/:gameId/evaluation?explain=1
 */
router.get(
  '/reports/games/:gameId/evaluation',
  asyncHandler(async (req, res) => {
    const explain = req.query.explain === '1';
    const data = await reportsService.getGameEvaluation(req.user.userId, req.params.gameId, { explain });
    res.json(data);
  })
);

module.exports = router;
