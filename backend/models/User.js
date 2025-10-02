const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, required: true, unique: true },
  handicap: { type: Number, default: 0, required: true }, // [추가]
});

module.exports = mongoose.model('User', userSchema);