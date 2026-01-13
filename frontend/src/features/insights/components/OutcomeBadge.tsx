// frontend/src/features/insights/components/OutcomeBadge.tsx
import React from "react";
import { Badge } from "@mantine/core";
import type { OutcomeCategory } from "../utils/teamOutcome";

const LABEL: Record<OutcomeCategory, string> = {
  CARRY_WIN: "캐리승",
  NORMAL_WIN: "보통승",
  BUS_WIN: "버스승",
  HARD_LOSE: "억울패",
  NORMAL_LOSE: "보통패",
  SELF_LOSE: "내탓패",
};

const COLOR: Record<OutcomeCategory, string> = {
  CARRY_WIN: "teal",
  NORMAL_WIN: "blue",
  BUS_WIN: "indigo",
  HARD_LOSE: "yellow",
  NORMAL_LOSE: "gray",
  SELF_LOSE: "red",
};

export default function OutcomeBadge({
  value,
  size = "sm",
  variant = "light",
}: {
  value: OutcomeCategory;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "light" | "filled" | "outline";
}) {
  return (
    <Badge radius="xl" size={size} variant={variant} color={COLOR[value]}>
      {LABEL[value]}
    </Badge>
  );
}