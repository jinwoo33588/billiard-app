// frontend/src/features/insights/api.ts
import axiosInstance from "../../shared/api/axiosInstance";

export async function getMyInsightsApi(windowSize: number) {
  const res = await axiosInstance.get("/me/insights", {
    params: { window: windowSize },
  });
  return res.data;
}