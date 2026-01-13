// frontend/src/features/insights/components/InsightsHeader.tsx
import React from "react";
import { Card, Group, Stack, Text, Badge, SegmentedControl } from "@mantine/core";

export type WindowPreset = "10" | "30" | "THIS_MONTH" | "ALL";

export default function InsightsHeader({
  preset,
  onChangePreset,
  windowN,
  updatedAt,
}: {
  preset: WindowPreset;
  onChangePreset: (v: WindowPreset) => void;
  windowN: number;
  updatedAt: string;
}) {
  return (
    <Card withBorder radius="md" p="sm">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text fw={900} size="lg">
              Insights
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              업데이트 {new Date(updatedAt).toLocaleString()}
            </Text>
          </Stack>

          <Badge radius="xl" variant="light">
            window {windowN}
          </Badge>
        </Group>

        {/* ✅ window 선택 */}
        <SegmentedControl
          fullWidth
          size="sm"
          value={preset}
          onChange={(v) => onChangePreset(v as WindowPreset)}
          data={[
            { label: "10판", value: "10" },
            { label: "30판", value: "30" },
            { label: "이번달", value: "THIS_MONTH" },
            { label: "전체", value: "ALL" },
          ]}
        />

        {preset === "THIS_MONTH" && (
          <Text size="xs" c="dimmed">
            ※ 이번달은 현재 lastN 근사치로 계산됩니다.
          </Text>
        )}
      </Stack>
    </Card>
  );
}