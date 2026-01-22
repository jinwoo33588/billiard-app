const { validateUpdateMe } = require("../validators/me.validator");
const usersService = require("../services/users.service");

async function getMe(req, res) {
  const user = await usersService.getUserById(req.user.userId);
  return res.json(user.toPublic());
}

async function updateMe(req, res) {
  const patch = validateUpdateMe(req.body);
  const user = await usersService.updateMyProfile(req.user.userId, patch);
  return res.json(user.toPublic());
}

module.exports = { getMe, updateMe };