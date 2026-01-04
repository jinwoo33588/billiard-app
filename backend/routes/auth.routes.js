// backend/routes/auth.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

const router = express.Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, nickname, handicap } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      nickname,
      handicap: Number(handicap) || 0,
    });

    res.status(201).json({ message: '회원가입 성공!' });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      const e = new Error('이메일 또는 비밀번호가 잘못되었습니다.');
      e.status = 401;
      throw e;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '7d',
    });

    res.json({
      message: '로그인 성공!',
      user: {
        _id: user._id,
        nickname: user.nickname,
        email: user.email,
        handicap: user.handicap,
      },
      token,
    });
  })
);

module.exports = router;