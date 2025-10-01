const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // [추가] .env 파일을 읽어들입니다.

const app = express();
const port = 4000;
const MONGO_URI = process.env.MONGO_URI; 

// --- 미들웨어 설정 ---
app.use(cors());
app.use(express.json());

// --- 데이터베이스 연결 ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB에 성공적으로 연결되었습니다.'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// --- 라우터 불러오기 ---
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/games');

// --- API 라우트 위임 ---
app.get('/', (req, res) => res.send('서버가 실행 중입니다!'));
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// --- 서버 실행 ---
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});