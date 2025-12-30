// backend/constants/handicapBenchmarks.js
// ✅ 핸디캡(15~40)별 기대 에버리지 기준표 (직접 수정용)

const HANDICAP_BENCHMARKS = [
  { handicap: 15, expected: 0.250, min: 0.240, max: 0.260 },
  { handicap: 16, expected: 0.270, min: 0.260, max: 0.280 },
  { handicap: 17, expected: 0.295, min: 0.280, max: 0.310 },
  { handicap: 18, expected: 0.325, min: 0.310, max: 0.340 },
  { handicap: 19, expected: 0.355, min: 0.340, max: 0.370 },

  { handicap: 20, expected: 0.385, min: 0.370, max: 0.400 },
  { handicap: 21, expected: 0.420, min: 0.400, max: 0.440 },
  { handicap: 22, expected: 0.460, min: 0.440, max: 0.480 },
  { handicap: 23, expected: 0.505, min: 0.480, max: 0.530 },
  { handicap: 24, expected: 0.555, min: 0.530, max: 0.580 },

  { handicap: 25, expected: 0.610, min: 0.580, max: 0.640 },
  { handicap: 26, expected: 0.655, min: 0.640, max: 0.670 },
  { handicap: 27, expected: 0.695, min: 0.670, max: 0.720 },
  { handicap: 28, expected: 0.760, min: 0.720, max: 0.800 },
  { handicap: 29, expected: 0.825, min: 0.800, max: 0.850 },

  { handicap: 30, expected: 0.900, min: 0.850, max: 0.950 },

  
  { handicap: 31, expected: 0.720, min: 0.670, max: 0.770 },
  { handicap: 32, expected: 0.740, min: 0.690, max: 0.790 },
  { handicap: 33, expected: 0.760, min: 0.710, max: 0.810 },
  { handicap: 34, expected: 0.780, min: 0.730, max: 0.830 },
  { handicap: 35, expected: 0.800, min: 0.750, max: 0.850 },
  { handicap: 36, expected: 0.820, min: 0.770, max: 0.870 },
  { handicap: 37, expected: 0.840, min: 0.790, max: 0.890 },
  { handicap: 38, expected: 0.860, min: 0.810, max: 0.910 },
  { handicap: 39, expected: 0.880, min: 0.830, max: 0.930 },
  { handicap: 40, expected: 0.900, min: 0.850, max: 0.950 },
];

const BENCHMARK_MAP = new Map(HANDICAP_BENCHMARKS.map((b) => [b.handicap, b]));

function getBenchmark(handicap) {
  const h = Math.round(Number(handicap) || 0);
  if (BENCHMARK_MAP.has(h)) return BENCHMARK_MAP.get(h);
  if (h < 15) return BENCHMARK_MAP.get(15);
  if (h > 40) return BENCHMARK_MAP.get(40);
  // 방어 로직(중간 누락 대비)
  for (let d = 1; d <= 30; d++) {
    if (BENCHMARK_MAP.has(h - d)) return BENCHMARK_MAP.get(h - d);
    if (BENCHMARK_MAP.has(h + d)) return BENCHMARK_MAP.get(h + d);
  }
  return BENCHMARK_MAP.get(25);
}

module.exports = { HANDICAP_BENCHMARKS, getBenchmark };