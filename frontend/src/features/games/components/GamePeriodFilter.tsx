import React from "react";
import { Card, Stack, Group, Button, Badge, Text } from "@mantine/core";
import type { DatesRangeValue } from "@mantine/dates";
import DateFieldFlatpickr from "../../../shared/components/DateFieldFlatpickr";

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

// "YYYY-MM-DD" -> Date | null
function ymdToDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Date | null -> "YYYY-MM-DD"
function dateToYmd(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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
  const [fromD, toD] = dateRange ?? [null, null];

  const applyCustomRange = (nextFrom: Date | null, nextTo: Date | null) => {
    // ✅ from/to 둘 다 있으면 정렬 보정 (from <= to)
    let a = nextFrom;
    let b = nextTo;
    if (a && b && a.getTime() > b.getTime()) [a, b] = [b, a];

    setDateRange([a, b]);

    // ✅ 예전 로직 유지: 하나라도 있으면 custom, 둘 다 없으면 all
    setFilterMode(a || b ? "custom" : "all");
    setSelectedYear(null);
    setSelectedMonth0(null);
  };

  return (
    <Card p="sm" radius="md" withBorder>
      <Stack gap="md">
        {/* ✅ 기존 DatePickerInput(range) 대신: Flatpickr 2개 */}
        <Group grow align="flex-end" gap="sm" wrap="nowrap">
          <DateFieldFlatpickr
            label="시작일"
            value={dateToYmd(fromD)}
            onChange={(ymd) => applyCustomRange(ymdToDate(ymd), toD)}
            error={undefined}
          />
          <DateFieldFlatpickr
            label="종료일"
            value={dateToYmd(toD)}
            onChange={(ymd) => applyCustomRange(fromD, ymdToDate(ymd))}
            error={undefined}
          />
        </Group>

        <Group justify="space-between" gap="xs" wrap="wrap">
        
<Group gap="xs" wrap="wrap">
  <Button
    size="xs"
    radius="xl"
    variant={pillVariant(filterMode === "all")}
    onClick={() => {
      setFilterMode("all");
      setDateRange([null, null]);
      // 선택값 유지/초기화는 취향인데,
      // UI가 사라지는 문제랑은 무관. (사라지면 렌더 조건 문제)
    }}
  >
    전체
  </Button>

  {years.map((y) => (
    <Button
      key={y}
      size="xs"
      radius="xl"
      variant={pillVariant(filterMode === "yearMonth" && selectedYear === y)}
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

{/* ✅ Month 영역: 항상 렌더 */}
<Group gap="xs" wrap="wrap" mt={6}>
  {selectedYear === null ? (
    <Text size="xs" c="dimmed">
      연도를 선택하면 월 필터가 활성화됩니다.
    </Text>
  ) : (
    <>
      <Button
        size="xs"
        radius="xl"
        variant={pillVariant(filterMode === "yearMonth" && selectedMonth0 === null)}
        onClick={() => {
          setSelectedMonth0(null);
          setFilterMode("yearMonth");
        }}
      >
        {selectedYear} 전체
      </Button>

      {monthsInYear.map((m0) => {
        const count = monthCounts.get(m0) || 0;
        const active = filterMode === "yearMonth" && selectedMonth0 === m0;

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
    </>
  )}
</Group>

        <Text c="dimmed" size="xs">
          * 기간 직접 선택을 하면 pill 필터보다 우선 적용됩니다.
        </Text>
      </Stack>
    </Card>
  );
}