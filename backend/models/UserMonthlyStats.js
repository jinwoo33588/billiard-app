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

const userMonthlyStatsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    monthKey: { type: String, required: true, index: true }, // "YYYY-MM"
    year: { type: Number, required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12, index: true },
    core: { type: statsCoreSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userMonthlyStatsSchema.index({ userId: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model("UserMonthlyStats", userMonthlyStatsSchema);