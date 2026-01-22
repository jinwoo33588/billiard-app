const { validateRegister, validateLogin } = require("../validators/auth.validator");
const authService = require("../services/auth.service");

async function register(req, res) {
  const input = validateRegister(req.body);
  const { token, user } = await authService.register(input);
  return res.json({ token, user: user.toPublic() });
}

async function login(req, res) {
  const input = validateLogin(req.body);
  const { token, user } = await authService.login(input);
  return res.json({ token, user: user.toPublic() });
}

module.exports = { register, login };