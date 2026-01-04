// backend/routes/rankings.routes.js
const express = require('express');
const asyncHandler = require('../utils/asyncHandler');

const rankingsService = require('../services/rankings/rankings.service');
const { validateRankingQuery } = require('../utils/validators');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { hasMonthFilter, year, month } = validateRankingQuery(req.query);
    const data = await rankingsService.getRanking({ hasMonthFilter, year, month });
    res.json(data);
  })
);

module.exports = router;