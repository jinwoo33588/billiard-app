// frontend/src/features/insights/components/InsightCardShell.tsx
import React from "react";
import { Card } from "@mantine/core";

export default function InsightCardShell({
  children,
  p = "sm",
}: {
  children: React.ReactNode;
  p?: "xs" | "sm" | "md";
}) {
  return (
    <Card
      withBorder
      radius="md"
      p={p}
      style={{
        background: "var(--mantine-color-body)",
        borderColor: "rgba(0,0,0,0.08)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
      }}
    >
      {children}
    </Card>
  );
}