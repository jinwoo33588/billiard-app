// routes/users.routes.js
const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");

const usersController = require("../controllers/users.controller");

const router = express.Router();

// ✅ 로그인 필요(랭킹/프로필은 보통 로그인 사용자만 보게)
router.use(authMiddleware);

/**
 * GET /api/users/:id/dashboard
 * - 유저 프로필 페이지에서 필요한 데이터(요약 통계 + 최근 게임들) 한번에 내려줌
 */
router.get("/:id/dashboard", asyncHandler(usersController.getUserDashboard));

module.exports = router;