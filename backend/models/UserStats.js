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
      // avg = score/inning
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

const userStatsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      index: true,
      required: true,
    },
    core: { type: statsCoreSchema, default: () => ({}) },
    // ✅ Lazy backfill 잠금용
    rebuildLock: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserStats", userStatsSchema);