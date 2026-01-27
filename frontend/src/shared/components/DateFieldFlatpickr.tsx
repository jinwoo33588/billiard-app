import React from "react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css"; // 테마는 원하면 변경 가능
import { TextInput } from "@mantine/core";

type Props = {
  label?: string;
  value: string;                 // "YYYY-MM-DD"
  onChange: (v: string) => void;
  error?: string;
};

function toYmd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DateFieldFlatpickr({
  label = "경기 날짜",
  value,
  onChange,
  error,
}: Props) {
  return (
    <Flatpickr
      value={value}
      options={{
        dateFormat: "Y-m-d",
        disableMobile: true, // ✅ 모바일에서 네이티브로 자동 전환되는 걸 막아 UI 통일(원하면 false)
      }}
      onChange={(dates) => {
        const d = dates?.[0];
        if (!d) return;
        onChange(toYmd(d));
      }}
      render={(_, ref) => (
        <TextInput
          label={label}
          ref={ref as any}
          value={value}
          error={error}
          readOnly // ✅ 키보드 안 뜨고 picker로만 선택
          styles={{ input: { height: 44 } }}
        />
      )}
    />
  );
}