const User = require("../models/User");
const { HttpError } = require("../utils/httpError");

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

async function updateMyProfile(userId, patch) {
  const user = await getUserById(userId);

  if (patch.nickname !== undefined) user.nickname = patch.nickname;
  if (patch.handicap !== undefined) user.handicap = patch.handicap;

  await user.save();
  return user;
}

module.exports = { getUserById, updateMyProfile };