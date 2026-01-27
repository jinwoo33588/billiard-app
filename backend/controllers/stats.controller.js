// 역할
//	•	GET /api/me/stats?from&to 또는 ?limit
//	•	로그인 유저(req.user.userId) 기준으로 통계 반환

// controllers/me.controller.js
const statsService = require("../services/stats.service");
const { validateStatsQuery } = require("../validators/stats.validator"); // ✅ 너가 stats.validator.js로 만들었다고 했으니 이 경로

async function getMyStats(req, res){
  // ✅ 1) 쿼리 검증/정규화
  const opt = validateStatsQuery(req.query);
  // opt 예시:
  // { mode: "range", range: {from:"2025-10-01",to:"2025-12-31"}, limit: null }
  // { mode: "limit", range:{from:null,to:null}, limit: 20 }
  // { mode: "all", ... }

  // ✅ 2) 서비스 호출
  const stats = await statsService.getMyStats(req.user.userId, opt);

  // ✅ 3) 응답
  res.json(stats);
}

module.exports = {
  getMyStats,
};