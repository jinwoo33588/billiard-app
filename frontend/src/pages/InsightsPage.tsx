// frontend/src/pages/InsightsPage.tsx
import React from "react";
import { Stack } from "@mantine/core";
import { useInsights } from "../features/insights/useInsights";
import { useGames } from "../features/games/useGames";

import HandicapScoreCard from "../features/insights/components/HandicapScoreCard";
import RecentStatsCard from "../features/insights/components/RecentStatsCard";
import RecentRatedGamesCard from "../features/insights/components/RecentRatedGamesCard";
// 또는 GameListWithEdit 재사용해도 됨

export default function InsightsPage() {
  const iq = useInsights({ mode: "limit", limit: 10 });
  const gq = useGames({ limit: 10 });

  if (iq.loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (iq.error || !iq.data) return <div style={{ padding: 12 }}>Error: {iq.error}</div>;

  return (
    <div style={{ padding: 12 }}>
      <Stack gap="md">
        <HandicapScoreCard data={iq.data.handicapScore} />
        {/* <RecentStatsCard title="최근 10판 요약" stats={iq.data.stats} /> */}

        {!gq.loading && !gq.error ? <RecentRatedGamesCard games={gq.games as any} /> : null}
      </Stack>
    </div>
  );
}