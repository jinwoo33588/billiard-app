import { Card, Stack, Group, Button, Badge, Text } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import type { DatesRangeValue } from "@mantine/dates";

type Props = {
  dateRange: DatesRangeValue<Date>;
  setDateRange: (v: DatesRangeValue<Date>) => void;

  filterMode: "all" | "custom" | "yearMonth";
  setFilterMode: (v: "all" | "custom" | "yearMonth") => void;

  years: number[];
  selectedYear: number | null;
  setSelectedYear: (v: number | null) => void;

  monthsInYear: number[]; // 0-based
  selectedMonth0: number | null; // 0-based
  setSelectedMonth0: (v: number | null) => void;

  monthCounts: Map<number, number>;
  pillVariant: (active: boolean) => "filled" | "light";
  clearAllFilters: () => void;
};

export default function GamePeriodFilter({
  dateRange,
  setDateRange,
  filterMode,
  setFilterMode,
  years,
  selectedYear,
  setSelectedYear,
  monthsInYear,
  selectedMonth0,
  setSelectedMonth0,
  monthCounts,
  pillVariant,
  clearAllFilters,
}: Props) {
  return (
    <Card p="sm" radius="md" withBorder>
      <Stack gap="md">
        {/* ✅ 이전 방식: DatePickerInput(range) 한 덩어리 */}
        <DatePickerInput
          type="range"
          label="기간 직접 선택"
          placeholder="분석할 기간 선택"
          value={dateRange}
          locale="ko"
          valueFormat="YYYY년 M월 D일"
          onChange={(value: DatesRangeValue<Date | string>) => {
            const next: DatesRangeValue<Date> = [
              value[0] ? new Date(value[0]) : null,
              value[1] ? new Date(value[1]) : null,
            ];
            setDateRange(next);
            setFilterMode(next[0] || next[1] ? "custom" : "all");
            setSelectedYear(null);
            setSelectedMonth0(null);
          }}
          clearable
        />

        <Group justify="space-between" gap="xs" wrap="wrap">
          <Group gap="xs" wrap="wrap">
            <Button
              size="xs"
              radius="xl"
              variant={pillVariant(filterMode === "all" && selectedYear === null)}
              onClick={() => {
                setSelectedYear(null);
                setSelectedMonth0(null);
                setDateRange([null, null]);
                setFilterMode("all");
              }}
            >
              전체
            </Button>

            {years.map((y) => (
              <Button
                key={y}
                size="xs"
                radius="xl"
                variant={pillVariant(selectedYear === y && filterMode === "yearMonth")}
                onClick={() => {
                  setSelectedYear(y);
                  setSelectedMonth0(null);
                  setFilterMode("yearMonth");
                }}
              >
                {y}
              </Button>
            ))}
          </Group>

          <Button variant="subtle" size="xs" onClick={clearAllFilters}>
            필터 초기화
          </Button>
        </Group>

        {/* ✅ 이전 방식: 연도 선택시에만 월 영역 등장 */}
        {selectedYear !== null && (
          <Group gap="xs" wrap="wrap">
            <Button
              size="xs"
              radius="xl"
              variant={pillVariant(selectedMonth0 === null && filterMode === "yearMonth")}
              onClick={() => {
                setSelectedMonth0(null);
                setFilterMode("yearMonth");
              }}
            >
              {selectedYear} 전체
            </Button>

            {monthsInYear.map((m0) => {
              const count = monthCounts.get(m0) || 0;
              const active = selectedMonth0 === m0 && filterMode === "yearMonth";

              return (
                <Button
                  key={m0}
                  size="xs"
                  radius="xl"
                  variant={pillVariant(active)}
                  onClick={() => {
                    setSelectedMonth0(m0);
                    setFilterMode("yearMonth");
                  }}
                  rightSection={
                    <Badge size="xs" variant={active ? "filled" : "light"}>
                      {count}
                    </Badge>
                  }
                >
                  {m0 + 1}월
                </Button>
              );
            })}
          </Group>
        )}

        <Text c="dimmed" size="xs">
          * 기간 직접 선택을 하면 pill 필터보다 우선 적용됩니다.
        </Text>
      </Stack>
    </Card>
  );
}
