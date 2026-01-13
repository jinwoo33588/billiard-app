// backend/services/stats/stats.write.js
const mongoose = require("mongoose");

const Game = require("../../models/Game");
const UserStats = require("../../models/UserStats");
const UserDailyStats = require("../../models/UserDailyStats");
const UserMonthlyStats = require("../../models/UserMonthlyStats");

const { dayKeyOf, monthKeyOf, dayStart, ymOf } = require("./stats.keys");
const {
  emptyCore,
  getDeltaFromGame,
  applyDelta,
  applyBestOnInsert,
  markBestDirtyIfNeeded,
} = require("./stats.core");

async function upsertUserStatsDoc(userId, session) {
  return await UserStats.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, core: emptyCore() } },
    { new: true, upsert: true, session }
  );
}

async function upsertDailyDoc(userId, gameDate, session) {
  const dayKey = dayKeyOf(gameDate);
  const date = dayStart(gameDate);
  return await UserDailyStats.findOneAndUpdate(
    { userId, dayKey },
    { $setOnInsert: { userId, dayKey, date, core: emptyCore() } },
    { new: true, upsert: true, session }
  );
}

async function upsertMonthlyDoc(userId, gameDate, session) {
  const monthKey = monthKeyOf(gameDate);
  const { year, month } = ymOf(gameDate);
  return await UserMonthlyStats.findOneAndUpdate(
    { userId, monthKey },
    { $setOnInsert: { userId, monthKey, year, month, core: emptyCore() } },
    { new: true, upsert: true, session }
  );
}

async function applyCreate(game, session) {
  const delta = getDeltaFromGame(game);

  const all = await upsertUserStatsDoc(game.userId, session);
  applyDelta(all.core, delta, +1);
  applyBestOnInsert(all.core, delta);
  await all.save({ session });

  const daily = await upsertDailyDoc(game.userId, game.gameDate, session);
  applyDelta(daily.core, delta, +1);
  applyBestOnInsert(daily.core, delta);
  await daily.save({ session });

  const monthly = await upsertMonthlyDoc(game.userId, game.gameDate, session);
  applyDelta(monthly.core, delta, +1);
  applyBestOnInsert(monthly.core, delta);
  await monthly.save({ session });
}

async function applyDelete(game, session) {
  const delta = getDeltaFromGame(game);

  const all = await upsertUserStatsDoc(game.userId, session);
  applyDelta(all.core, delta, -1);
  markBestDirtyIfNeeded(all.core, game);
  await all.save({ session });

  const daily = await upsertDailyDoc(game.userId, game.gameDate, session);
  applyDelta(daily.core, delta, -1);
  markBestDirtyIfNeeded(daily.core, game);
  await daily.save({ session });

  const monthly = await upsertMonthlyDoc(game.userId, game.gameDate, session);
  applyDelta(monthly.core, delta, -1);
  markBestDirtyIfNeeded(monthly.core, game);
  await monthly.save({ session });
}

async function applyUpdate(oldGame, newGame, session) {
  await applyDelete(oldGame, session);
  await applyCreate(newGame, session);
}

async function createGameAndUpdateStats(userId, payload) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const created = await Game.create([{ ...payload, userId }], { session });
    const game = created[0];

    await applyCreate(game, session);

    await session.commitTransaction();
    return game;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

async function deleteGameAndUpdateStats(userId, gameId) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const old = await Game.findOne({ _id: gameId, userId }).session(session);
    if (!old) return null;

    await Game.deleteOne({ _id: gameId, userId }).session(session);
    await applyDelete(old, session);

    await session.commitTransaction();
    return old;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

async function updateGameAndUpdateStats(userId, gameId, payload) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const old = await Game.findOne({ _id: gameId, userId }).session(session);
    if (!old) return null;

    const updated = await Game.findOneAndUpdate(
      { _id: gameId, userId },
      { $set: payload },
      { new: true, session }
    );

    await applyUpdate(old, updated, session);

    await session.commitTransaction();
    return updated;
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}

module.exports = {
  createGameAndUpdateStats,
  updateGameAndUpdateStats,
  deleteGameAndUpdateStats,
};