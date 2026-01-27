// backend/controllers/insights.controller.js
const insightsService = require("../services/insights/insights.service");
const { validateInsightsQuery } = require("../validators/insights.validator");

async function getMyInsights(req, res) {
  const opt = validateInsightsQuery(req.query);

  const data = await insightsService.getMyInsights(req.user.userId, opt);
  res.json(data);
}

module.exports = {
  getMyInsights,
};