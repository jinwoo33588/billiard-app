// backend/config/db.js
const mongoose = require("mongoose");

async function connectDB(){
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is missing");
  }
  // strictQuery 설정(선택사항))
  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log("[db] connected");
}

module.exports = { connectDB };