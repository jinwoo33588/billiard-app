// backend/services/stats/stats.rebuild.js
const mongoose = require("mongoose");
const Game = require("../../models/Game");
const UserStats = require("../../models/UserStats");
const UserDailyStats = require("../../models/UserDailyStats");
const UserMonthlyStats = require("../../models/UserMonthlyStats");

const { dayKeyOf, monthKeyOf, dayStart, ymOf } = require("./stats.keys");
const { emptyCore, getDeltaFromGame, applyDelta, applyBestOnInsert } = require("./stats.core");

/**
 * ✅ 유저 1명 통계 전체 재생성 (all + daily + monthly)
 * - 서비스 중: deleteMany 후 insertMany로 “정답”을 다시 만듦
 */
async function rebuildStatsForUser(userId, session) {
  console.log("[rebuild] userId=", userId, "type=", typeof userId);

  const games = await Game.find({ userId })
    .sort({ gameDate: 1 })
    .select("score inning result gameDate userId")
    .session(session);

    console.log("[rebuild] games found =", games.length);
if (games[0]) console.log("[rebuild] sample game.userId =", games[0].userId);

  const allCore = emptyCore();
  const dailyMap = new Map();   // dayKey -> core
  const monthlyMap = new Map(); // monthKey -> core

  for (const g of games) {
    const delta = getDeltaFromGame(g);

    applyDelta(allCore, delta, +1);
    applyBestOnInsert(allCore, delta);

    const dk = dayKeyOf(g.gameDate);
    if (!dailyMap.has(dk)) dailyMap.set(dk, emptyCore());
    const dCore = dailyMap.get(dk);
    applyDelta(dCore, delta, +1);
    applyBestOnInsert(dCore, delta);

    const mk = monthKeyOf(g.gameDate);
    if (!monthlyMap.has(mk)) monthlyMap.set(mk, emptyCore());
    const mCore = monthlyMap.get(mk);
    applyDelta(mCore, delta, +1);
    applyBestOnInsert(mCore, delta);
  }

  await UserStats.deleteMany({ userId }).session(session);
  await UserDailyStats.deleteMany({ userId }).session(session);
  await UserMonthlyStats.deleteMany({ userId }).session(session);

  await UserStats.create([{ userId, core: allCore }], { session });

  const dailyDocs = [];
  for (const [dayKey, core] of dailyMap.entries()) {
    dailyDocs.push({
      userId,
      dayKey,
      date: dayStart(new Date(dayKey)),
      core,
    });
  }
  if (dailyDocs.length) await UserDailyStats.insertMany(dailyDocs, { session });

  const monthlyDocs = [];
  for (const [monthKey, core] of monthlyMap.entries()) {
    const { year, month } = ymOf(new Date(`${monthKey}-01T00:00:00.000Z`));
    monthlyDocs.push({
      userId,
      monthKey,
      year,
      month,
      core,
    });
  }
  if (monthlyDocs.length) await UserMonthlyStats.insertMany(monthlyDocs, { session });

  return true;
}

/**
 * ✅ Lazy Backfill with lock
 * - 동시에 여러 요청이 와도 1명만 rebuild하도록 잠금
 *
 * 잠금 방식:
 * - UserStats에 rebuildLock: Date 필드를 사용 (없으면 schema에 allow)
 * - 일정 시간(예: 2분) 안의 lock은 “진행중”으로 간주
 */
async function ensureStatsReady(userId, opts = {}) {
  const lockMs = opts.lockMs ?? 2 * 60 * 1000;
  const now = new Date();
  const lockThreshold = new Date(Date.now() - lockMs);

  // 1) 이미 core 있으면 끝
  const existing = await UserStats.findOne({ userId }).select("core updatedAt rebuildLock");
  if (existing?.core?.updatedAt) return { ready: true, rebuilt: false };

  // 2) lock 획득 시도 (+ core를 setOnInsert로 같이 생성!)
  const locked = await UserStats.findOneAndUpdate(
    {
      userId,
      $or: [
        { rebuildLock: { $exists: false } },
        { rebuildLock: null },
        { rebuildLock: { $lte: lockThreshold } },
      ],
    },
    {
      $set: { rebuildLock: now },
      $setOnInsert: { userId, core: emptyCore() }, // ✅ 핵심!
    },
    { upsert: true, new: true }
  ).select("rebuildLock");

  // 3) 내가 lock holder가 아니면(다른 요청이 진행중) 잠깐 기다렸다가 재확인
  if (!locked || locked.rebuildLock?.getTime() !== now.getTime()) {
    // 짧게 2~3번만 폴링
    for (let i = 0; i < 3; i++) {
      await new Promise((r) => setTimeout(r, 250));
      const again = await UserStats.findOne({ userId }).select("core");
      if (again?.core?.updatedAt) return { ready: true, rebuilt: false };
    }
    return { ready: false, rebuilt: false };
  }
  console.log("[ensureStatsReady] rebuilding stats for", String(userId));

  // 4) 내가 lock holder → 트랜잭션 rebuild
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    await rebuildStatsForUser(userId, session);

    // lock 해제
    await UserStats.updateOne({ userId }, { $set: { rebuildLock: null } }).session(session);

    await session.commitTransaction();
    return { ready: true, rebuilt: true };
  } catch (e) {
    await session.abortTransaction();
    try {
      await UserStats.updateOne({ userId }, { $set: { rebuildLock: null } });
    } catch {}
    throw e;
  } finally {
    session.endSession();
  }
}
module.exports = { ensureStatsReady, rebuildStatsForUser };