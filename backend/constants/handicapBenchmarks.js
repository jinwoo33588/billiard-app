// backend/constants/handicapBenchmarks.js
// ✅ 핸디캡(점수)별 기대 에버리지(Avg) 기준표
// - expected: 해당 핸디에서 "기대"되는 avg
// - band: 적정 범위(시각화/판정용) - 지금은 넉넉하게, 나중에 튜닝

const HANDICAP_BENCHMARKS = [
  // 예시(너가 가진 기준표로 교체/확장)
  { handicap: 15, expected: 0.240, min: 0.230, max: 0.250 },
  { handicap: 16, expected: 0.260, min: 0.250, max: 0.270 },
  { handicap: 17, expected: 0.280, min: 0.270, max: 0.295 },
  { handicap: 18, expected: 0.310, min: 0.295, max: 0.325 },
  { handicap: 19, expected: 0.340, min: 0.325, max: 0.355 },
  { handicap: 20, expected: 0.370, min: 0.355, max: 0.385 },
  { handicap: 21, expected: 0.400, min: 0.385, max: 0.420 },
  { handicap: 22, expected: 0.440, min: 0.420, max: 0.460 }, // 52이닝
  { handicap: 23, expected: 0.480, min: 0.460, max: 0.505 }, // 50이닝
  { handicap: 24, expected: 0.530, min: 0.505, max: 0.555 }, // 48이닝
  { handicap: 25, expected: 0.580, min: 0.555, max: 0.610 }, // 46이닝
  { handicap: 26, expected: 0.640, min: 0.610, max: 0.660 }, // 44이닝
  { handicap: 27, expected: 0.700, min: 0.660, max: 0.735 }, // 42이닝
  { handicap: 28, expected: 0.770, min: 0.735, max: 0.790 }, // 40이닝
  { handicap: 29, expected: 0.810, min: 0.790, max: 0.830 }, // 39이닝
  { handicap: 30, expected: 0.850, min: 0.830, max: 0.875 }, // 38이닝
  { handicap: 31, expected: 0.900, min: 0.875, max: 0.925 },
  { handicap: 32, expected: 0.950, min: 0.925, max: 1.000 },
  { handicap: 33, expected: 1.050, min: 1.000, max: 1.075 },
  { handicap: 34, expected: 1.100, min: 1.075, max: 1.125 },
  { handicap: 35, expected: 1.150, min: 1.125, max: 1.200 },
  // { handicap: 36, expected: 0., min: 0., max: 0. },
  // { handicap: 37, expected: 0., min: 0., max: 0. },
  // { handicap: 38, expected: 0., min: 0., max: 0. },
  // { handicap: 39, expected: 0., min: 0., max: 0. },
  // { handicap: 40, expected: 0., min: 0., max: 0. },
];

module.exports = { HANDICAP_BENCHMARKS };