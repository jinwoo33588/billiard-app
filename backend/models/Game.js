const mongoose = require('mongoose');

const GAME_RESULTS = ['WIN', 'DRAW', 'LOSE', 'UNKNOWN'];
const GAME_TYPES = ['UNKNOWN', '1v1', '2v2', '2v2v2', '3v3', '3v3v3'];

const gameSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    inning: {
      type: Number,
      required: true,
      min: 1,
    },

    // ✅ 지금은 항상 들어오더라도, 나중에 누락 대비용
    result: {
      type: String,
      enum: GAME_RESULTS,
      default: 'UNKNOWN',
      required: true,
    },

    // ✅ 팀전/개인전 판별용(분석 안정성)
    gameType: {
      type: String,
      enum: GAME_TYPES,
      default: 'UNKNOWN',
      required: true,
    },

    gameDate: {
      type: Date,
      required: true,
      index: true,
    },

    memo: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// ✅ 가장 자주 쓰는 조회 패턴 최적화 (내 경기 목록/최근 N판)
gameSchema.index({ userId: 1, gameDate: -1 });

module.exports = mongoose.model('Game', gameSchema);