// frontend/src/pages/InsightsPage.tsx
import { Stack } from "@mantine/core";
import { useInsights } from "../features/insights/useInsights";
import { useGames } from "../features/games/useGames";

import HandicapScoreCard from "../features/insights/components/HandicapScoreCard";
import FormTrendCard from "../features/insights/components/FormTrendCard";
import StreakCard from "../features/insights/components/StreakCard";
import RatingBadgeDonutCard from "../features/insights/components/RatingBadgeDonutCard";
import BestWorstGameCard from "../features/insights/components/BestWorstGameCard";
import TeamTypeStatsCard from "../features/insights/components/TeamTypeStatsCard";
// 또는 GameListWithEdit 재사용해도 됨

export default function InsightsPage() {
  const iq = useInsights({ mode: "limit", limit: 20 });
  const gq = useGames({ limit: 20 });

  if (iq.loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (iq.error || !iq.data) return <div style={{ padding: 12 }}>Error: {iq.error}</div>;

  return (
    <div style={{ padding: 12 }}>
      <Stack gap="md">
        <HandicapScoreCard data={iq.data} />
        {!gq.loading && !gq.error ? <FormTrendCard games={gq.games} /> : null}
        {!gq.loading && !gq.error ? <TeamTypeStatsCard games={gq.games} /> : null}
        {!gq.loading && !gq.error ? <StreakCard games={gq.games} limit={30} /> : null}
        {!gq.loading && !gq.error ? <RatingBadgeDonutCard games={gq.games} /> : null}
        {!gq.loading && !gq.error ? <BestWorstGameCard games={gq.games} /> : null}
        {/* <RecentStatsCard title="최근 10판 요약" stats={iq.data.stats} /> */}

        {/* {!gq.loading && !gq.error ? <RecentRatedGamesCard games={recentGames} /> : null} */}
      </Stack>
    </div>
  );
}
