import React from "react";
import { Group, SegmentedControl, Stack, Text, Title } from "@mantine/core";

export  function InsightsHeader({
  windowSize,
  setWindowSize,
}: {
  windowSize: number;
  setWindowSize: (n: number) => void;
}) {
  return (
    <Stack gap={6}>
      <Title order={3}>Insights</Title>
      <Group justify="space-between" align="center">
        <Text size="xs" c="dimmed">폼(에버) + 팀전(gps)</Text>
        <SegmentedControl
          size="xs"
          value={String(windowSize)}
          onChange={(v) => setWindowSize(Number(v))}
          data={[
            { label: "10판", value: "10" },
            { label: "30판", value: "30" },
            { label: "60판", value: "60" },
          ]}
        />
      </Group>
    </Stack>
  );
}