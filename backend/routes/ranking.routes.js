const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const rankingController = require("../controllers/ranking.controller");

const router = express.Router();

router.use(authMiddleware);
router.get("/", asyncHandler(rankingController.getRanking));

module.exports = router;