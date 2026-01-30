import { Group, Text } from "@mantine/core";

export default function Metric({
  label,
  value,
  suffix,
  strong,
  align = "left",
}: {
  label: string;
  value: string;
  suffix?: string;
  strong?: boolean;
  align?: "left" | "center" | "right";
}) {
  return (
    <div style={{ display: "grid", gap: 6, textAlign: align }}>
      <Text size="xs" c="dimmed" fw={900} style={{ lineHeight: 1 }}>
        {label}
      </Text>

      <Group gap={6} align="baseline" wrap="nowrap" justify={align === "center" ? "center" : "flex-start"}>
        <Text
          fw={strong ? 950 : 900}
          style={{
            fontSize: strong ? 22 : 18,
            letterSpacing: -0.3,
            lineHeight: 1.05,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </Text>
        {suffix ? (
          <Text size="sm" c="dimmed" fw={800}>
            {suffix}
          </Text>
        ) : null}
      </Group>
    </div>
  );
}
