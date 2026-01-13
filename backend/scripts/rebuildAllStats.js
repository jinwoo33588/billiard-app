require("dotenv").config();
const mongoose = require("mongoose");

const Game = require("../models/Game");
const UserStats = require("../models/UserStats");
const UserDailyStats = require("../models/UserDailyStats");
const UserMonthlyStats = require("../models/UserMonthlyStats");

const { rebuildStatsForUser } = require("../services/stats/stats.rebuild");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[rebuildAll] connected:", mongoose.connection.name);

  // ✅ 게임이 존재하는 유저만 대상으로 (가장 안전)
  const userIds = await Game.distinct("userId");
  console.log("[rebuildAll] users:", userIds.length);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];

    const session = await mongoose.startSession();
    try {
      session.startTransaction();

      // ✅ 기존 꼬인 문서 제거 후 rebuild (rebuildStatsForUser 안에서 delete/insert 하도록 되어있으면 생략 가능)
      // await UserStats.deleteMany({ userId }).session(session);
      // await UserDailyStats.deleteMany({ userId }).session(session);
      // await UserMonthlyStats.deleteMany({ userId }).session(session);

      await rebuildStatsForUser(userId, session);

      await session.commitTransaction();
      ok++;

      if ((i + 1) % 20 === 0) {
        console.log(`[rebuildAll] progress ${i + 1}/${userIds.length} (ok=${ok}, fail=${fail})`);
      }
    } catch (e) {
      await session.abortTransaction();
      fail++;
      console.error("[rebuildAll] FAIL userId=", String(userId), e.message);
    } finally {
      session.endSession();
    }
  }

  console.log("[rebuildAll] DONE ok=", ok, "fail=", fail);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});