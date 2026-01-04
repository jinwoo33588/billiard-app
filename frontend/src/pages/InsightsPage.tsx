import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Center,
  Collapse,
  Divider,
  Group,
  List,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import { useInsights } from "../features/insights/hooks";
import { fmt, getConfidence, splitReasons, statusMeta } from "../features/insights/utils";
import SkillCard from "../features/insights/components/SkillCard";
import TeamLuckCard from "../features/insights/components/TeamLuckCard";

type WindowOpt = "10" | "20" | "30";

export default function InsightsPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [windowSize, setWindowSize] = useState<WindowOpt>("10");
  const { data, loading, errorMsg } = useInsights(Number(windowSize));
  const [opened, { toggle }] = useDisclosure(false);

  const all = data?.all;
  const team = data?.teamIndicators;

  const meta = all ? statusMeta(all.status) : statusMeta("데이터부족");
  const conf = all ? getConfidence(all.sampleN) : getConfidence(0);

  const reasons = all?.reasons ?? [];
  const { top, rest } = useMemo(() => splitReasons(reasons, 2), [reasons]);

  if (loading) {
    return (
      <Center style={{ minHeight: "60vh" }}>
        <Loader />
      </Center>
    );
  }

  if (errorMsg) {
    return (
      <Center style={{ minHeight: "60vh" }}>
        <Stack align="center">
          <Text c="red">{errorMsg}</Text>
          <Text size="sm" c="dimmed">
            인사이트 API 경로(/me/insights 또는 /users/insights)랑 토큰 첨부를 확인해줘.
          </Text>
        </Stack>
      </Center>
    );
  }

  if (!data || !all || !team) {
    return (
      <Center style={{ minHeight: "60vh" }}>
        <Text c="dimmed">표시할 데이터가 없습니다.</Text>
      </Center>
    );
  }

  const stats = all.stats;
  const bench = all.benchmark;

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="flex-end" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Title order={3} style={{ lineHeight: 1.1 }}>
            분석 · 핸디 {data.handicap}점
          </Title>
          <Text size="sm" c="dimmed">
            최근 {data.window}판 기준
          </Text>
        </div>

        <Select
          value={windowSize}
          onChange={(v) => setWindowSize((v as WindowOpt) || "10")}
          data={[
            { value: "10", label: "최근 10판" },
            { value: "20", label: "최근 20판" },
            { value: "30", label: "최근 30판" },
          ]}
          w={isMobile ? 120 : 140}
          radius="xl"
          size="sm"
        />
      </Group>

      <Card withBorder radius="md" p="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="xs" wrap="wrap">
            <Badge color={meta.color} variant="filled" radius="xl">
              {meta.emoji} 폼 {meta.label}
            </Badge>
            <Badge variant="light" radius="xl" color={conf.color}>
              신뢰도 {conf.level}
            </Badge>
          </Group>

          <Badge
            variant="light"
            radius="xl"
            color={
              all.recommendation.handicapDelta > 0
                ? "green"
                : all.recommendation.handicapDelta < 0
                ? "red"
                : "gray"
            }
          >
            {all.recommendation.label}
          </Badge>
        </Group>

        <Divider my="sm" />

        {!stats ? (
          <Text size="sm" c="dimmed">
            최근 기록이 적어서 아직 확정 판단을 내리기 어려워요. (최소 5판 필요)
          </Text>
        ) : (
          <SimpleGrid cols={2} spacing="sm" verticalSpacing="xs">
            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">
                최근 평균 에버
              </Text>
              <Text fw={800} size="xl">
                {fmt(stats.recentAvg, 3)}
              </Text>
              <Text size="xs" c="dimmed">
                기대 {fmt(bench.expected, 3)} · Δ {stats.delta >= 0 ? "+" : ""}
                {fmt(stats.delta, 3)}
              </Text>
            </div>

            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">
                승률(무 제외)
              </Text>
              <Text fw={800} size="xl">
                {fmt(stats.winRate, 1)}%
              </Text>
              <Text size="xs" c="dimmed">
                {stats.wins}승 {stats.draws}무 {stats.losses}패
              </Text>
            </div>
          </SimpleGrid>
        )}
      </Card>

      <SimpleGrid cols={isMobile ? 1 : 2} spacing="sm" verticalSpacing="sm">
        <SkillCard all={all} />
        <TeamLuckCard team={team} />
      </SimpleGrid>

      <Card withBorder radius="md" p="sm">
        <Text fw={800} mb={6}>
          근거
        </Text>

        <List spacing="xs" size="sm" center>
          {top.length ? top.map((r, i) => <List.Item key={`top-${i}`}>{r}</List.Item>) : <List.Item>표시할 근거가 없습니다.</List.Item>}
        </List>

        {rest.length > 0 && (
          <>
            <Collapse in={opened}>
              <List spacing="xs" size="sm" center mt="xs">
                {rest.map((r, i) => <List.Item key={`rest-${i}`}>{r}</List.Item>)}
              </List>
            </Collapse>

            <Group justify="center" mt="sm">
              <Button
                variant="subtle"
                size="xs"
                onClick={toggle}
                rightSection={opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              >
                {opened ? "근거 접기" : `근거 더보기 (+${rest.length})`}
              </Button>
            </Group>
          </>
        )}

        <Divider my="sm" />

        <SimpleGrid cols={2} spacing="sm" verticalSpacing="xs">
          <div style={{ textAlign: "center" }}>
            <Text size="xs" c="dimmed">
              평균 diff
            </Text>
            <Text fw={800}>{fmt(team.diffSummary?.avgDiff, 2)}</Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Text size="xs" c="dimmed">
              + / - 비율
            </Text>
            <Text fw={800}>
              {fmt(team.diffSummary?.overRate, 0)}% / {fmt(team.diffSummary?.underRate, 0)}%
            </Text>
          </div>
        </SimpleGrid>

        <Text size="xs" c="dimmed" mt="sm">
          * 팀전 분석은 추정치입니다. (정확도는 표본 수에 비례)
        </Text>
      </Card>
    </Stack>
  );
}