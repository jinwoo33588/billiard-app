const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const meRoutes = require("./routes/me.routes");
const meGamesRoutes = require("./routes/me.games.routes");
const insightsRoutes = require("./routes/insights.routes");

// const gamesRoutes = require("./routes/games.routes");
// const statsRoutes = require("./routes/stats.routes");

const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/me/games", meGamesRoutes);
app.use("/api/me/insights", insightsRoutes);
// app.use("/api/stats", statsRoutes);

// 마지막에 에러 미들웨어
app.use(errorMiddleware);

module.exports = app;