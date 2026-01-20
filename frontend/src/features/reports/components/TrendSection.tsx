import { Card, Table, Text, Group, Badge } from "@mantine/core";
import type { MonthRow } from "../dashboard.types";

function fmt3(n: number) {
  return Number.isFinite(n) ? n.toFixed(3) : "0.000";
}
function fmt1(n: number) {
  return Number.isFinite(n) ? n.toFixed(1) : "0.0";
}

export default function TrendSection({ rows }: { rows: MonthRow[] }) {
  const safeRows = rows ?? [];

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb="xs">
        <Text fw={800}>최근 월별 추세</Text>
        <Badge variant="light" radius="xl">
          {safeRows.length}개월
        </Badge>
      </Group>

      <Table highlightOnHover withRowBorders={false} verticalSpacing="xs" >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>월</Table.Th>
            <Table.Th ta="right">판수</Table.Th>
            <Table.Th ta="right">avg</Table.Th>
            <Table.Th ta="right">승률</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {safeRows.map((r) => (
            <Table.Tr key={r.monthKey}>
              <Table.Td>{r.label}</Table.Td>
              <Table.Td ta="right">{r.totalGames}</Table.Td>
              <Table.Td ta="right">{fmt3(r.average)}</Table.Td>
              <Table.Td ta="right">{fmt1(r.winRate)}%</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
