const rankingService = require("../services/ranking.service");
const { validateRankingQuery } = require("../validators/ranking.validator");

async function getRanking(req, res) {
  const q = validateRankingQuery(req.query);
  const data = await rankingService.getRanking(q);
  res.json(data);
}

module.exports = { getRanking };