import React, { useMemo, useState } from "react";
import { Card, Container, Group, Loader, Stack, Tabs, Text } from "@mantine/core";
import { useMyInsights } from "../features/insights/hooks";
import { InsightsHeader } from "../features/insights/components/InsightsHeader";
import FormCard from "../features/insights/components/FormCard";
import TeamSummaryCard from "../features/insights/components/TeamSummaryCard";
import TeamGameList from "../features/insights/components/TeamGameList";


export default function InsightsPage() {
  const [windowSize, setWindowSize] = useState(60);
  const { data, loading, error, refetch } = useMyInsights(windowSize);

  const all = data?.all;
  const team = data?.team;

  const teamGames = useMemo(() => (team?.games || []).slice(), [team?.games]);

  return (
    <Container size="sm" px="sm" py="sm">
      <Stack gap="sm">
        <InsightsHeader windowSize={windowSize} setWindowSize={setWindowSize} />

        {loading && (
          <Card withBorder radius="md" p="md">
            <Group>
              <Loader size="sm" />
              <Text size="sm" c="dimmed">불러오는 중…</Text>
            </Group>
          </Card>
        )}

        {error && !loading && (
          <Card withBorder radius="md" p="md" onClick={refetch} style={{ cursor: "pointer" }}>
            <Text fw={800}>에러</Text>
            <Text size="sm" c="dimmed">{error}</Text>
            <Text size="xs" c="dimmed" mt={6}>탭하면 다시 시도</Text>
          </Card>
        )}

        {!loading && data && all && team && (
          <Tabs defaultValue="all" variant="pills" radius="xl">
            <Tabs.List grow>
              <Tabs.Tab value="all">전체</Tabs.Tab>
              <Tabs.Tab value="form">폼</Tabs.Tab>
              <Tabs.Tab value="team">팀전</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="all" pt="sm">
              <Stack gap="sm">
                <FormCard all={all} />
                <TeamSummaryCard team={team} />
                <TeamGameList games={teamGames} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="form" pt="sm">
              <Stack gap="sm">
                <FormCard all={all} />
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="team" pt="sm">
              <Stack gap="sm">
                <TeamSummaryCard team={team} />
                <TeamGameList games={teamGames} />
              </Stack>
            </Tabs.Panel>
          </Tabs>
        )}
      </Stack>
    </Container>
  );
}