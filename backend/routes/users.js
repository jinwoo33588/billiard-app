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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
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

// 랭킹 조회 API (수정)
router.get('/ranking', async (req, res) => {
  try {
    const ranking = await User.aggregate([
      // 1. User 컬렉션의 모든 사용자를 기준으로, Game 컬렉션과 'left join'을 수행합니다.
      {
        $lookup: {
          from: 'games', // Game 모델에 해당하는 컬렉션 이름 (보통 소문자 복수형)
          localField: '_id', // User 컬렉션의 _id 필드
          foreignField: 'userId', // Game 컬렉션의 userId 필드
          as: 'games' // 조인된 게임 기록들을 'games'라는 배열 필드에 저장
        }
      },
      // 2. 각 사용자의 통계를 계산하여 새로운 필드를 추가합니다.
      {
        $addFields: {
          totalGames: { $size: '$games' },
          wins: {
            $size: {
              $filter: { input: '$games', as: 'game', cond: { $eq: ['$$game.result', '승'] } }
            }
          },
          draws: {
            $size: {
              $filter: { input: '$games', as: 'game', cond: { $eq: ['$$game.result', '무'] } }
            }
          },
          losses: {
            $size: {
              $filter: { input: '$games', as: 'game', cond: { $eq: ['$$game.result', '패'] } }
            }
          },
          totalScore: { $sum: '$games.score' },
          totalInnings: { $sum: '$games.inning' }
        }
      },
      // 3. 최종적으로 보여줄 필드를 선택하고 에버리지, 승률을 계산합니다.
      {
        $project: {
          userId: '$_id',
          nickname: '$nickname',
          totalGames: 1,
          wins: 1,
          draws: 1,
          losses: 1,
          average: { $cond: [{ $eq: ['$totalInnings', 0] }, 0, { $divide: ['$totalScore', '$totalInnings'] }] },
          winRate: { $cond: [{ $eq: ['$totalGames', 0] }, 0, { $multiply: [{ $divide: ['$wins', '$totalGames'] }, 100] }] }
        }
      },
      // 4. 에버리지 높은 순, 에버리지가 같으면 총 경기수가 많은 순으로 정렬합니다.
      { $sort: { average: -1, totalGames: -1 } }
    ]);

    res.status(200).send(ranking);
  } catch (error) {
    console.error('랭킹 조회 중 에러 발생:', error);
    res.status(500).send({ message: '서버 에러가 발생했습니다.' });
  }
});

module.exports = router;