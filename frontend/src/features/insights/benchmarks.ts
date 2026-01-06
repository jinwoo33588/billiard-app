// 프론트용: backend/constants/handicapBenchmarks.js 와 동일한 기준표
// ✅ 여기 수치가 바뀌면 "핸디 위치 게이지 / 추정 핸디"가 같이 바뀜.

export const HANDICAP_BENCHMARKS = [
  { handicap: 15, expected: 0.250, min: 0.0, max: 0.260 },
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

  // 백엔드에서 31~40을 주석 처리한 상태라면 프론트도 동일하게 맞춰둠.
  // 나중에 백엔드에 다시 추가하면 여기에도 같이 풀어주면 됨.
] as const;

export type HandicapBenchmark = (typeof HANDICAP_BENCHMARKS)[number];