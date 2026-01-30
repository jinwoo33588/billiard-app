const adminService = require("../services/admin.service");

async function getOverview(req, res) {
  const data = await adminService.getOverview();
  res.json(data);
}

async function listUsers(req, res) {
  const { limit, q, includeGames, gameLimit, mode, recentLimit } = req.query;
  const items = await adminService.listUsers({
    limit,
    q,
    includeGames: includeGames === "1" || includeGames === "true",
    gameLimit,
    mode: mode || "all",
    recentLimit,
  });
  res.json({ items });
}

async function getUserGames(req, res) {
  const { id } = req.params;
  const { limit, from, to } = req.query;
  const items = await adminService.listUserGames(id, { limit, from, to });
  res.json({ items });
}

async function getUserDashboard(req, res) {
  const { id } = req.params;
  const { recent, insightsLimit } = req.query;
  const data = await adminService.getUserDashboard(id, {
    recent: Number(recent) || 10,
    insightsLimit: Number(insightsLimit) || 20,
  });
  res.json(data);
}

module.exports = {
  getOverview,
  listUsers,
  getUserGames,
  getUserDashboard,
};
