/* eslint-disable no-console */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const { startOfDay } = require("../utils/date");
const Game = require("../models/Game");

const USER_ID = process.env.USER_ID || "68dce97f9c35fe0b3ace6ba3";
const EFFECTIVE_DATE = process.env.EFFECTIVE_DATE || "2025-12-24"; // YYYY-MM-DD
const HANDICAP = Number(process.env.HANDICAP || 26);
const MODE = process.env.MODE || "from"; // "from" | "before"
const OVERWRITE = process.env.OVERWRITE === "1";

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is required");

  const start = startOfDay(EFFECTIVE_DATE);
  if (!start) throw new Error("invalid EFFECTIVE_DATE");
  if (!mongoose.isValidObjectId(USER_ID)) throw new Error("invalid USER_ID");
  if (!Number.isFinite(HANDICAP)) throw new Error("invalid HANDICAP");

  await mongoose.connect(uri);

  const match = {
    userId: new mongoose.Types.ObjectId(USER_ID),
    gameDate: MODE === "before" ? { $lt: start } : { $gte: start },
  };

  if (!OVERWRITE) {
    match.$or = [{ handicapAtGame: { $exists: false } }, { handicapAtGame: null }];
  }

  const res = await Game.updateMany(match, { $set: { handicapAtGame: HANDICAP } });
  console.log(
    `[backfill] user=${USER_ID} mode=${MODE} date=${EFFECTIVE_DATE} handicap=${HANDICAP} overwrite=${OVERWRITE} matched=${res.matchedCount} modified=${res.modifiedCount}`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
