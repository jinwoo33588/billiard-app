const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const authMiddleware = require('../middleware/auth');

// 새로운 경기 기록
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { score, inning, result, gameType, gameDate, memo } = req.body;
    const newGame = new Game({ userId, score, inning, result, gameType, gameDate, memo });
    await newGame.save();
    res.status(201).send({ message: '경기가 성공적으로 기록되었습니다.', game: newGame });
  } catch (error) {
    console.error('경기 기록 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

// 내 경기 기록 조회
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const games = await Game.find({ userId }).sort({ gameDate: -1 });
    res.status(200).send(games);
  } catch (error) {
    console.error('경기 기록 조회 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

// 특정 경기 기록 수정
router.put('/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;
    const updatedData = req.body;
    const updatedGame = await Game.findOneAndUpdate(
      { _id: gameId, userId: userId },
      updatedData,
      { new: true }
    );
    if (!updatedGame) {
      return res.status(404).send({ message: '해당 기록을 찾을 수 없거나 수정할 권한이 없습니다.' });
    }
    res.status(200).send({ message: '경기가 성공적으로 수정되었습니다.', game: updatedGame });
  } catch (error) {
    console.error('경기 수정 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

// 특정 경기 기록 삭제
router.delete('/:gameId', authMiddleware, async (req, res) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.userId;
    const deletedGame = await Game.findOneAndDelete({ _id: gameId, userId: userId });
    if (!deletedGame) {
      return res.status(404).send({ message: '해당 기록을 찾을 수 없거나 삭제할 권한이 없습니다.' });
    }
    res.status(200).send({ message: '경기가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('경기 삭제 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

// 특정 사용자의 모든 경기 기록 조회 API (공개)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const games = await Game.find({ userId: userId }).sort({ gameDate: -1 });
    res.status(200).send(games);
  } catch (error) {
    console.error('특정 사용자 경기 기록 조회 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

module.exports = router;