// src/features/insights/hooks.ts
import { useEffect, useState } from "react";
import type { InsightsResponse } from "./types";
import { fetchInsights } from "./api";
import { normalizeTeamIndicators } from "./nomalize";

export function useInsights(windowSize: number) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const raw = await fetchInsights(windowSize);

        // ✅ 팀지표는 항상 V2로 정규화
        const normalized: InsightsResponse = {
          ...raw,
          teamIndicators: normalizeTeamIndicators(raw.teamIndicators),
        };

        if (alive) setData(normalized);
      } catch (e) {
        console.error(e);
        if (alive) setErrorMsg("분석 데이터를 불러오지 못했습니다.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [windowSize]);

  return { data, loading, errorMsg };
}