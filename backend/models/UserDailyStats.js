const mongoose = require("mongoose");

const statsCoreSchema = new mongoose.Schema(
  {
    counts: {
      totalGames: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
    },
    totals: {
      totalScore: { type: Number, default: 0 },
      totalInnings: { type: Number, default: 0 },
    },
    moments: {
      sumAvg: { type: Number, default: 0 },
      sumSqAvg: { type: Number, default: 0 },
    },
    best: {
      bestScore: { type: Number, default: 0 },
      bestAverage: { type: Number, default: 0 },
    },
    needsRebuild: {
      best: { type: Boolean, default: false },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userDailyStatsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    dayKey: { type: String, required: true, index: true }, // "YYYY-MM-DD"
    date: { type: Date, required: true, index: true },     // day start 00:00
    core: { type: statsCoreSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userDailyStatsSchema.index({ userId: 1, dayKey: 1 }, { unique: true });

module.exports = mongoose.model("UserDailyStats", userDailyStatsSchema);