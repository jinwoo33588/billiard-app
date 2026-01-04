import React from "react";
import { Stack, Title, SegmentedControl } from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";

type Props = {
  titleText: string;
  mode: "all" | "month";
  setMode: (v: "all" | "month") => void;
  monthValue: Date | null;
  setMonthValue: (v: Date | null) => void;
};

export default function RankingHeader({
  titleText,
  mode,
  setMode,
  monthValue,
  setMonthValue,
}: Props) {
  return (
    <Stack gap="xs">
      <Title order={2} ta="center">
        {titleText}
      </Title>

      <Stack gap="xs" px="xs">
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as "all" | "month")}
          fullWidth
          data={[
            { label: "전체", value: "all" },
            { label: "월별", value: "month" },
          ]}
        />

        {mode === "month" && (
          <MonthPickerInput
            value={monthValue}
            onChange={setMonthValue}
            placeholder="월 선택"
            clearable={false}
          />
        )}
      </Stack>
    </Stack>
  );
}