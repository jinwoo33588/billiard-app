import { Text } from "@mantine/core";

type Props = {
  label: string;
  value: string | number;
  color?: string;
  size?: "xs" | "sm";
  background?: string;
  borderColor?: string;
};

export default function Pill({
  label,
  value,
  color,
  size = "sm",
  background = "rgba(255,255,255,0.9)",
  borderColor = "rgba(0,0,0,0.08)",
}: Props) {
  const px = size === "xs" ? 8 : 10;
  const fz = size === "xs" ? 11 : 12;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: px,
        borderRadius: 999,
        border: `1px solid ${borderColor}`,
        background,
      }}
    >
      <Text size="xs" c="dimmed" fw={900} style={{ fontSize: fz }}>
        {label}
      </Text>
      <Text
        size="sm"
        fw={950}
        style={{
          color,
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1,
        }}
      >
        {value}
      </Text>
    </div>
  );
}
