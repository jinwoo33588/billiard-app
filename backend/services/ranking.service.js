const User = require("../models/User");

/** 이번달 range 만들기 */
function thisMonthRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m0 = now.getMonth();
  const from = new Date(y, m0, 1);
  const to = new Date(y, m0 + 1, 0);
  return { from, to };
}

function sortStage(metric) {
  // 0게임 유저도 있으니 2차 정렬로 nickname 같은 안정 정렬 추천
  if (metric === "winRate") return { "stats.winRate": -1, "stats.avg": -1, "user.nickname": 1 };
  return { "stats.avg": -1, "stats.winRate": -1, "user.nickname": 1 };
}

async function getRanking({ mode, metric, limit }) {
  const window =
    mode === "thisMonth"
      ? (() => {
          const { from, to } = thisMonthRange();
          return {
            mode,
            range: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) },
            match: { gameDate: { $gte: from, $lte: to } },
          };
        })()
      : { mode, range: { from: null, to: null }, match: {} };

  // ✅ Users 기준 left-join
  // - pipeline $lookup 사용해서 게임 집계 결과를 stats로 붙임
  const rows = await User.aggregate([
    {
      $project: {
        _id: 1,
        nickname: 1,
        handicap: 1,
      },
    },

    {
      $lookup: {
        from: "games",
        let: { uid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$userId", "$$uid"] },
              ...window.match,
            },
          },
          {
            $group: {
              _id: null,
              gamesCount: { $sum: 1 },
              wins: { $sum: { $cond: [{ $eq: ["$result", "WIN"] }, 1, 0] } },
              draws: { $sum: { $cond: [{ $eq: ["$result", "DRAW"] }, 1, 0] } },
              loses: { $sum: { $cond: [{ $eq: ["$result", "LOSE"] }, 1, 0] } },
              scoreSum: { $sum: "$score" },
              inningSum: { $sum: "$inning" },
              twoTeamCount: { $sum: { $cond: [{ $in: ["$gameType", ["1v1", "2v2", "3v3"]] }, 1, 0] } },
              threeTeamCount: { $sum: { $cond: [{ $in: ["$gameType", ["2v2v2", "3v3v3"]] }, 1, 0] } },
              unknownTeamCount: { $sum: { $cond: [{ $in: ["$gameType", ["UNKNOWN", null]] }, 1, 0] } },
            },
          },
          {
            $addFields: {
              avg: {
                $cond: [{ $gt: ["$inningSum", 0] }, { $divide: ["$scoreSum", "$inningSum"] }, 0],
              },
              winRate: {
                // ✅ 너 정책: 승률 = wins / (wins + loses) (draw 제외)
                $let: {
                  vars: { den: { $add: ["$wins", "$loses"] } },
                  in: { $cond: [{ $gt: ["$$den", 0] }, { $divide: ["$wins", "$$den"] }, 0] },
                },
              },
              expectedWinRate: {
                $let: {
                  vars: {
                    total: { $add: ["$twoTeamCount", "$threeTeamCount", "$unknownTeamCount"] },
                  },
                  in: {
                    $cond: [
                      { $gt: ["$$total", 0] },
                      {
                        $divide: [
                          {
                            $add: [
                              { $multiply: ["$twoTeamCount", 0.5] },
                              { $multiply: ["$threeTeamCount", 0.6666667] },
                              { $multiply: ["$unknownTeamCount", 0.5] },
                            ],
                          },
                          "$$total",
                        ],
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              gamesCount: 1,
              wins: 1,
              draws: 1,
              loses: 1,
              avg: 1,
              winRate: 1,
              expectedWinRate: 1,
            },
          },
        ],
        as: "statsArr",
      },
    },

    // statsArr[0] 없으면 0으로 채우기
    {
      $addFields: {
        stats: {
          $ifNull: [
            { $arrayElemAt: ["$statsArr", 0] },
            { gamesCount: 0, wins: 0, draws: 0, loses: 0, avg: 0, winRate: 0 },
          ],
        },
      },
    },
    { $project: { statsArr: 0 } },

    // 정렬
    { $sort: sortStage(metric) },

    // 제한
    { $limit: limit },

    // 최종 shape
    {
      $project: {
        user: { id: "$_id", nickname: "$nickname", handicap: "$handicap" },
        stats: 1,
      },
    },
  ]);

  const items = rows.map((r, idx) => ({
    rank: idx + 1,
    user: {
      id: String(r.user.id),
      nickname: r.user.nickname ?? "Unknown",
      handicap: typeof r.user.handicap === "number" ? r.user.handicap : 0,
    },
    stats: r.stats,
  }));

  return {
    window: { mode: window.mode, range: window.range },
    metric,
    items,
  };
}

module.exports = { getRanking };
