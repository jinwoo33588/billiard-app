// User 모델 전용 파일
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);