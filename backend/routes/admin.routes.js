const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

// ✅ MVP: 인증 없이 접근 (운영 전환 시 미들웨어 붙이면 됨)

router.get("/overview", asyncHandler(adminController.getOverview));
router.get("/users", asyncHandler(adminController.listUsers));
router.get("/users/:id/games", asyncHandler(adminController.getUserGames));
router.get("/users/:id/dashboard", asyncHandler(adminController.getUserDashboard));

module.exports = router;
