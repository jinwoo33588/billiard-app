import  axiosInstance from "../api/axiosInstance";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function warmupBackend() {
  // 슬립이면 첫 요청이 오래 걸릴 수 있으니 재시도
  const maxTries = 4;

  for (let i = 0; i < maxTries; i++) {
    try {
      await axiosInstance.get("/health", { timeout: 8000 });
      return; // 성공하면 끝
    } catch (e) {
      // 0s, 1s, 2s, 4s 정도로 점점 기다렸다 재시도
      await sleep(1000 * Math.pow(2, i));
    }
  }

  // 여기까지 왔으면 워밍업 실패
  throw new Error("BACKEND_WARMUP_FAILED");
}