import React from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Divider,
  Stack,
  SimpleGrid,
  Center,
  Loader,
} from "@mantine/core";

function glassBadgeStyle(color: string) {
  return {
    background: "rgba(255,255,255,0.75)",
    color,
    border: "1px solid rgba(0,0,0,0.06)",
  } as const;
}


export default function StatsBlock(){
  return(
    <Card
    withBorder
    radius="md"
    p="sm"
    style={{
      background: "rgba(255,255,255,0.65)",
      borderColor: "rgba(0,0,0,0.06)",
    }}
      >
      스탯 카드
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text  fw={900} style={{ lineHeight: 1.1 }}>
              제목
            </Text>
            <Badge radius="xl" size="sm" variant="light" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              ##판
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
            소제목
          </Text>
        </div>
      </Group>

      <Divider my="xs" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
        {/* 승률 */}
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">승률</Text>

          <Group justify="center" gap={6} align="baseline" mt={8} wrap="nowrap">
            <Text
              size="xl"
              fw={900}
              style={{
                lineHeight: 1,
                color: `var(--mantine-color-7)`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              승률 ##
            </Text>
            <Text size="sm" c="dimmed">%</Text>
          </Group>

          <Group justify="center" gap={6} mt={10} wrap="wrap">
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle("var(--mantine-color-green-7)")}>
              #승
            </Badge>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle("var(--mantine-color-gray-7)")}>
              #무
            </Badge>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle("var(--mantine-color-red-7)")}>
              #패
            </Badge>
          </Group>

        </div>


        {/* 에버 */}
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">에버</Text>

          <Text
            size="xl"
            fw={900}
            mt={8}
            style={{
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            0.###
          </Text>

          <Group justify="center" mt={10}>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle("var(--mantine-color-gray-7)")}>
              총 ##이닝
            </Badge>
          </Group>
        </div>
      </SimpleGrid>

    </Card>
  )
}