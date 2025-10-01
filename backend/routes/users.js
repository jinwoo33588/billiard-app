const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game');
const authMiddleware = require('../middleware/auth');

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, nickname });
    await newUser.save();
    res.status(201).send({ message: '회원가입 성공!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: '회원가입 중 에러 발생' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }
    const token = jwt.sign({ userId: user._id }, 'MY_SECRET_KEY', { expiresIn: '1h' });
    res.status(200).send({
      message: '로그인 성공!',
      user: { _id: user._id, nickname: user.nickname, email: user.email },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: '로그인 중 에러 발생' });
  }
});

// 내 정보 조회
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

// 랭킹 조회 API
router.get('/ranking', async (req, res) => {
  try {
    const ranking = await Game.aggregate([
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          totalInnings: { $sum: '$inning' },
          totalGames: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ['$result', '승'] }, 1, 0] } },
          draws: { $sum: { $cond: [{ $eq: ['$result', '무'] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $eq: ['$result', '패'] }, 1, 0] } },
        }
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          nickname: '$user.nickname',
          totalGames: 1,
          wins: 1,
          draws: 1,
          losses: 1,
          average: { $cond: [{ $eq: ['$totalInnings', 0] }, 0, { $divide: ['$totalScore', '$totalInnings'] }] },
          winRate: { $cond: [{ $eq: ['$totalGames', 0] }, 0, { $multiply: [{ $divide: ['$wins', '$totalGames'] }, 100] }] }
        }
      },
      { $sort: { average: -1 } }
    ]);
    res.status(200).send(ranking);
  } catch (error) {
    console.error('랭킹 조회 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

// 특정 사용자 정보 조회
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