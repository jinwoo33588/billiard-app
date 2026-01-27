import React, { useState } from "react";
import RankingControls from "../features/ranking/components/RankingControls";
import RankingListCard from "../features/ranking/components/RankingListCard";
import { useRanking } from "../features/ranking/useRanking";
import type { RankingMetric, RankingMode } from "../features/ranking/types";
import { useAuth } from "../features/auth/useAuth"; // ✅ 추가

export default function RankingPage() {
  const { user } = useAuth(); // ✅ 추가 (user?.id or user?._id 프로젝트에 맞게)
  const myUserId = (user as any)?.id ?? (user as any)?._id ?? null;

  const [mode, setMode] = useState<RankingMode>("thisMonth");
  const [metric, setMetric] = useState<RankingMetric>("avg");

  const { loading, error, data, reload } = useRanking({ mode, metric, limit: 50 });

  return (
    <div style={{ padding: 12, display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 950, fontSize: 16 }}>랭킹</div>

      <RankingControls mode={mode} setMode={setMode} metric={metric} setMetric={setMetric} />

      <RankingListCard
        data={data}
        loading={loading}
        error={error}
        onReload={reload}
        myUserId={myUserId} // ✅ 추가
      />
    </div>
  );
}