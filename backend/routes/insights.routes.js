// backend/routes/insights.routes.js
const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");

const insightsController = require("../controllers/insights.controller");

const router = express.Router();

router.use(authMiddleware);

// GET /api/me/insights?mode=limit&limit=20
// GET /api/me/insights?mode=range&from=2026-01-01&to=2026-01-31
router.get("/", asyncHandler(insightsController.getMyInsights));

module.exports = router;