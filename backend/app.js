const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const meRoutes = require('./routes/me.routes');
const usersRoutes = require('./routes/users.routes');
const rankingsRoutes = require('./routes/rankings.routes');

const app = express();

// middleware
app.use(cors()); // 나중에 배포 도메인 생기면 origin 제한 추천
app.use(express.json());

// db
connectDB();

// health check
app.get("/api/health", (req, res) => {
  res.status(200).send("ok");
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/me', meRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rankings', rankingsRoutes);

// error handler (맨 마지막)
app.use(errorHandler);

module.exports = app;