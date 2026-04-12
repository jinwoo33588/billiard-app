// routes/me.games.routes.js
const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const { guestCheckMiddleware } = require("../utils/guestCheck");
const gamesController = require("../controllers/games.controller");

const router = express.Router();
router.use(authMiddleware);

router.get("/", asyncHandler(gamesController.listMyGames));
router.post(
  "/",
  guestCheckMiddleware,
  asyncHandler(gamesController.createMyGame),
);
router.get("/:id", asyncHandler(gamesController.getMyGame));
router.patch(
  "/:id",
  guestCheckMiddleware,
  asyncHandler(gamesController.updateMyGame),
);
router.delete(
  "/:id",
  guestCheckMiddleware,
  asyncHandler(gamesController.deleteMyGame),
);

module.exports = router;
