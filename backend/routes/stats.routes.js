const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth");

const statsRead = require("../services/stats/stats.read");

const router = express.Router();
router.use(authMiddleware);

router.get("/all", asyncHandler(async (req, res) => {
  const out = await statsRead.getAllStats(req.user.userId);
  res.json(out);
}));

router.get("/range", asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const out = await statsRead.getRangeStats(req.user.userId, from, to);
  res.json(out);
}));

router.get("/monthly", asyncHandler(async (req, res) => {
  const { fromMonthKey, toMonthKey } = req.query;
  const out = await statsRead.getMonthlySeries(req.user.userId, fromMonthKey, toMonthKey);
  res.json(out);
}));

module.exports = router;