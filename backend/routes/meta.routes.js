const express = require("express");
const { HANDICAP_BENCHMARKS } = require("../constants/handicapBenchmarks");

const router = express.Router();

// ✅ GET /api/meta/handicap-benchmarks
router.get("/handicap-benchmarks", (req, res) => {
  res.json({
    rows: HANDICAP_BENCHMARKS,
    updatedAt: new Date().toISOString(),
  });
});

module.exports = router;