const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game');
const authMiddleware = require('../middleware/auth');
const { getInsightsForUser } = require('../services/insights.service');

// 회원가입 API
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname, handicap } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, nickname, handicap });
    await newUser.save();
    res.status(201).send({ message: '회원가입 성공!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: '회원가입 중 에러 발생' });
  }
});

// 로그인 API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    res.status(200).send({
      message: '로그인 성공!',
      user: { _id: user._id, nickname: user.nickname, email: user.email, handicap: user.handicap },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: '로그인 중 에러 발생' });
  }
});

// 내 정보 조회 API
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: '서버 에러 발생' });
  }
});

// 내 정보 수정
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { handicap, nickname } = req.body;
    const update = {};
    if (handicap !== undefined) update.handicap = Number(handicap);
    if (nickname !== undefined) update.nickname = nickname;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: update },
      { new: true }
    ).select('-password');

    res.status(200).send(user);
  } catch (error) {
    console.error('내 정보 수정 중 에러:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

// ✅ ✅ ✅ 인사이트 API (JWT 필요)
router.get('/insights', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const windowSizeRaw = Number(req.query.window) || 10;
    const windowSize = Math.max(1, Math.min(50, windowSizeRaw));

    const data = await getInsightsForUser(userId, windowSize);
    res.status(200).send(data);
  } catch (error) {
    console.error('인사이트 조회 중 에러:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

// 랭킹 조회 API
router.get('/ranking', async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month); // 1~12

    const hasMonthFilter = Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12;

    const start = hasMonthFilter ? new Date(year, month - 1, 1) : null;
    const end = hasMonthFilter ? new Date(year, month, 1) : null;

    const ranking = await User.aggregate([
      {
        // ✅ 월별이면 해당 월 게임만, 아니면 전체 게임
        $lookup: {
          from: 'games',
          let: { uid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$uid'] } } },
            ...(hasMonthFilter
              ? [{ $match: { gameDate: { $gte: start, $lt: end } } }]
              : []),
          ],
          as: 'games',
        },
      },
      {
        $addFields: {
          totalGames: { $size: '$games' },
          wins: { $size: { $filter: { input: '$games', as: 'game', cond: { $eq: ['$$game.result', '승'] } } } },
          draws: { $size: { $filter: { input: '$games', as: 'game', cond: { $eq: ['$$game.result', '무'] } } } },
          losses: { $size: { $filter: { input: '$games', as: 'game', cond: { $eq: ['$$game.result', '패'] } } } },
          totalScore: { $sum: '$games.score' },
          totalInnings: { $sum: '$games.inning' }
        }
      },
      {
        $project: {
          userId: '$_id',
          nickname: '$nickname',
          handicap: '$handicap',
          totalGames: 1,
          wins: 1,
          draws: 1,
          losses: 1,
          average: { $cond: [{ $eq: ['$totalInnings', 0] }, 0, { $divide: ['$totalScore', '$totalInnings'] }] },
          winRate: {
            $cond: [
              { $eq: [{ $add: ['$wins', '$losses'] }, 0] },
              0,
              { $multiply: [{ $divide: ['$wins', { $add: ['$wins', '$losses'] }] }, 100] }
            ]
          }
        }
      },
      // 월별일 때 "0전" 유저가 너무 많으면 보기 안 좋으니 숨기고 싶다면 아래 주석 해제
      // ...(hasMonthFilter ? [{ $match: { totalGames: { $gt: 0 } } }] : []),

      { $sort: { average: -1, totalGames: -1 } }
    ]);

    res.status(200).send(ranking);
  } catch (error) {
    console.error('랭킹 조회 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

// 특정 사용자 정보 조회 API
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('nickname');
    if (!user) {
      return res.status(404).send({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error('사용자 정보 조회 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});



module.exports = router;