// controllers/users.controller.js
const mongoose = require("mongoose");
const usersService = require("../services/users.service");
const { HttpError } = require("../utils/httpError");

function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, "invalid user id");
  return new mongoose.Types.ObjectId(id);
}

async function getUserDashboard(req, res) {
  const userId = toObjectId(req.params.id); // ✅ 여기서 변환
  const recent = Number(req.query.recent) || 10;
  const data = await usersService.getUserDashboard(userId, { recent });
  res.json(data);
}

module.exports = { getUserDashboard };
