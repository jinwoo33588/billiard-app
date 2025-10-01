const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  inning: { type: Number, required: true },
  result: { type: String, enum: ['승', '무', '패'], required: true }, // [수정] 한글로 변경
  gameType: { type: String, required: true },
  gameDate: { type: Date, required: true },
  memo: { type: String }, // [추가] 메모 필드
});

module.exports = mongoose.model('Game', gameSchema);