// /**
//  * games.routes.js
//  * - /api/games 라우팅
//  */

// const express = require("express");
// const asyncHandler = require("../utils/asyncHandler");
// const auth = require("../middleware/auth.middleware");
// const gamesController = require("../controllers/games.controller");
// const gamesValidator = require("../validators/games.validator");


// const router = express.Router();

// // 로그인한 사용자만
// router.use(auth);

// // 내 게임 목록
// router.get("/", asyncHandler(gamesController.listMyGames));
// // 내 게임 생성
// router.post("/", asyncHandler(gamesController.createMyGame));
// // 게임 1개 조회
// router.get("/:id", asyncHandler(gamesController.getMyGame));
// // 게임 수정
// router.put("/:id", asyncHandler(gamesController.updateMyGame));
// // 게임 삭제
// router.delete("/:id", asyncHandler(gamesController.deleteMyGame));

// module.exports = router;