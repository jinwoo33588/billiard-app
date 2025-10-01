// 인증 미들웨어 전용 파일.
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send({ message: '인증 토큰이 필요합니다.' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'MY_SECRET_KEY');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authMiddleware;