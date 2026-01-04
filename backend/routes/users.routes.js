// backend/routes/users.routes.js
const express = require('express');
const asyncHandler = require('../utils/asyncHandler');

const usersService = require('../services/users/users.service');
const gamesService = require('../services/games/games.service');

const router = express.Router();

// ✅ 공개 프로필
router.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    const user = await usersService.getPublicProfile(req.params.userId);
    res.json(user);
  })
);

// ✅ 공개 게임 목록(정책에 따라 필요 없으면 제거)
router.get(
  '/:userId/games',
  asyncHandler(async (req, res) => {
    const games = await gamesService.listUserGamesPublic(req.params.userId);
    res.json(games);
  })
);

module.exports = router;