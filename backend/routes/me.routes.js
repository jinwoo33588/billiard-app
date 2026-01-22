const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const meController = require("../controllers/me.controller");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(meController.getMe));
router.put("/", asyncHandler(meController.updateMe));

module.exports = router;