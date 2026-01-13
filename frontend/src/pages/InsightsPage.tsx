// frontend/src/pages/InsightsPage.tsx
import React, { useMemo, useState } from "react";
import { Button, Group, Loader, Stack, Text } from "@mantine/core";
import { useMyInsights } from "../features/insights/hooks";
import InsightsHeader, {
  WindowPreset,
} from "../features/insights/components/InsightsHeader";
import FormSummaryCard from "../features/insights/components/FormSummaryCard";
import TeamInsightsSection from "../features/insights/components/TeamInsightsSection";

import { useHandicapBenchmarks } from "../features/meta/useHandicapBenchmarks"; // 경로 맞춰
import HandicapBandTrackFromInsights from "../features/insights/components/HandicapBandTrackFromInsights";
import TeamOutcomeCard from "../features/insights/components/TeamOutcomeCard";
import FormScoreCard from "../features/insights/components/FormScoreCard";

function guessThisMonthWindowFallback() {
  return 60; // 임시 근사치
}

export default function InsightsPage() {

  // inside InsightsPage
const { rows: benchRows, loading: benchLoading } = useHandicapBenchmarks();


  const [preset, setPreset] = useState<WindowPreset>("30");

  const windowN = useMemo(() => {
    if (preset === "10") return 10;
    if (preset === "30") return 30;
    if (preset === "THIS_MONTH") return guessThisMonthWindowFallback();
    return 2000; // ALL
  }, [preset]);

  const { data, loading, error, refetch } = useMyInsights(windowN);

  if (loading) {
    return (
      <Stack p="sm" align="center" justify="center" style={{ minHeight: 240 }}>
        <Loader />
        <Text size="sm" c="dimmed">
          불러오는 중…
        </Text>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack p="sm" gap="sm">
        <Text c="red" fw={700}>
          {error}
        </Text>
        <Button onClick={refetch}>다시 시도</Button>
      </Stack>
    );
  }

  if (!data) {
    return (
      <Stack p="sm" gap="sm">
        <Text c="dimmed">데이터가 없습니다.</Text>
        <Button onClick={refetch}>새로고침</Button>
      </Stack>
    );
  }

  return (
    <Stack p="sm" gap="sm">
      {/* ✅ Header + window selector */}
      <InsightsHeader
        preset={preset}
        onChangePreset={setPreset}
        windowN={data.window}
        updatedAt={data.updatedAt}
      />

      <FormSummaryCard all={data.all} />

      <FormScoreCard all={data.all} rows={benchRows} showSim />

      {!benchLoading && (
  <HandicapBandTrackFromInsights all={data.all} rows={benchRows} />
)}

<TeamOutcomeCard games={data.team.games} />

      <TeamInsightsSection team={data.team} />

      <Group justify="center" mt="xs">
        <Button variant="light" onClick={refetch}>
          새로고침
        </Button>
      </Group>
    </Stack>
  );
}