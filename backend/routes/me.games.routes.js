// routes/me.games.routes.js
const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/auth.middleware");
const gamesController = require("../controllers/games.controller");

const router = express.Router();
router.use(authMiddleware);

router.get("/", asyncHandler(gamesController.listMyGames));
router.post("/", asyncHandler(gamesController.createMyGame));
router.get("/:id", asyncHandler(gamesController.getMyGame));
router.patch("/:id", asyncHandler(gamesController.updateMyGame));
router.delete("/:id", asyncHandler(gamesController.deleteMyGame));

module.exports = router;