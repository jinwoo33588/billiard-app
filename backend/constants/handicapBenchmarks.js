// backend/constants/handicapBenchmarks.js
// ✅ 핸디캡(점수)별 기대 에버리지(Avg) 기준표
// - expected: 해당 핸디에서 "기대"되는 avg
// - band: 적정 범위(시각화/판정용) - 지금은 넉넉하게, 나중에 튜닝

const HANDICAP_BENCHMARKS = [
  // 예시(너가 가진 기준표로 교체/확장)
  { handicap: 15, expected: 0.250, min: 0.240, max: 0.255 },
  { handicap: 16, expected: 0.265, min: 0.255, max: 0.270 },
  { handicap: 17, expected: 0.280, min: 0.270, max: 0.290 },
  { handicap: 18, expected: 0.310, min: 0.290, max: 0.320 },
  { handicap: 19, expected: 0.335, min: 0.320, max: 0.340 },
  { handicap: 20, expected: 0.355, min: 0.340, max: 0.370 },
  { handicap: 21, expected: 0.390, min: 0.370, max: 0.405 },
  { handicap: 22, expected: 0.420, min: 0.405, max: 0.440 }, // 52이닝
  { handicap: 23, expected: 0.460, min: 0.440, max: 0.480 }, // 50이닝
  { handicap: 24, expected: 0.500, min: 0.480, max: 0.520 }, // 48이닝
  { handicap: 25, expected: 0.540, min: 0.520, max: 0.575 }, // 46이닝
  { handicap: 26, expected: 0.590, min: 0.575, max: 0.615 }, // 44이닝
  { handicap: 27, expected: 0.640, min: 0.615, max: 0.670 }, // 42이닝
  { handicap: 28, expected: 0.700, min: 0.670, max: 0.720 }, // 40이닝
  { handicap: 29, expected: 0.740, min: 0.720, max: 0.760 }, // 39이닝
  { handicap: 30, expected: 0.780, min: 0.760, max: 0.800 }, // 38이닝
  { handicap: 31, expected: 0.830, min: 0.800, max: 0.860 },
  { handicap: 32, expected: 0.890, min: 0.860, max: 0.925 },
  { handicap: 33, expected: 0.960, min: 0.925, max: 0.980 },
  { handicap: 34, expected: 1.000, min: 0.980, max: 1.015 },
  { handicap: 35, expected: 1.030, min: 1.015, max: 1.045 },
  // { handicap: 36, expected: 0., min: 0., max: 0. },
  // { handicap: 37, expected: 0., min: 0., max: 0. },
  // { handicap: 38, expected: 0., min: 0., max: 0. },
  // { handicap: 39, expected: 0., min: 0., max: 0. },
  // { handicap: 40, expected: 0., min: 0., max: 0. },
];

module.exports = { HANDICAP_BENCHMARKS };