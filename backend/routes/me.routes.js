const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const { guestCheckMiddleware } = require("../utils/guestCheck");

const meController = require("../controllers/me.controller");
const statsController = require("../controllers/stats.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(meController.getMe));
router.put("/", guestCheckMiddleware, asyncHandler(meController.updateMe));


router.get("/stats", asyncHandler(statsController.getMyStats));

module.exports = router;