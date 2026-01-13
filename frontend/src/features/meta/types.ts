export type HandicapBenchmark = {
  handicap: number;   // 예: 26
  expected: number;   // 예: 0.655
  min: number;        // 예: 0.640
  max: number;        // 예: 0.670
};

export type HandicapBenchmarksResponse = {
  rows: HandicapBenchmark[];
  updatedAt?: string;
};