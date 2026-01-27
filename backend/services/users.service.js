const User = require("../models/User");
const { HttpError } = require("../utils/httpError");


const statsService = require("./stats.service");
const gamesService = require("./games.service");

// Date -> "YYYY-MM-DD"
function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// 이번달 범위(from/to) 만들기
function thisMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: ymd(from), to: ymd(to) };
}

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

async function getMyHandicap(userId) {
  const u = await User.findById(userId).select("handicap");
  if (!u) throw new HttpError(404, "user not found");
  const h = Number(u.handicap);
  return Number.isFinite(h) ? h : 0; // 기본값 정책
}

/**
 * ✅ 유저 프로필 대시보드 조립
 * - user 기본 정보
 * - stats: all / thisMonth / recent
 * - recentGames: 최근 N판(기본 10)
 */
async function getUserDashboard(userId, { recent = 10 } = {}) {
  const u = await User.findById(userId).select("nickname handicap").lean();
  if (!u) throw new HttpError(404, "user not found");

  const month = thisMonthRange();

  // ✅ stats 3종
  const [all, thisMonth, recentStats] = await Promise.all([
    statsService.getMyStats(userId, { mode: "all" }),
    statsService.getMyStats(userId, { mode: "range", range: month }),
    statsService.getMyStats(userId, { mode: "limit", limit: recent }),
  ]);

  // ✅ 최근 게임 리스트(게임 응답에 rating/avg 붙여둔 로직을 그대로 재사용)
  // gamesService.listMyGames가 "plain object(=toPublic 필요없는 형태)"로 돌려주게 만들어둔 상태라면 그대로 OK
  const recentGames = await gamesService.listMyGames(userId, { limit: recent });

  return {
    user: {
      id: String(u._id),
      nickname: u.nickname ?? "",
      handicap: Number(u.handicap ?? 0),
    },
    stats: {
      all,
      thisMonth,
      recent: recentStats,
    },
    recentGames,
  };
}

module.exports = { getUserById, updateMyProfile, getMyHandicap, getUserDashboard };