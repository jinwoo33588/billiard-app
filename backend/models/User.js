// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true }, // ✅ 해시가 들어갈 자리 (원문 금지)
    nickname: { type: String, required: true, unique: true, trim: true },
    handicap: { type: Number, default: 0, required: true, min: 0, max: 200 },
  },
  { timestamps: true }
);

// 프론트에 password 절대 보내지 않도록
userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    nickname: this.nickname,
    handicap: this.handicap,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);