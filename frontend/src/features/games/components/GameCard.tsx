import React from "react";
import { Card, Group, Text, Badge, ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import type { Game } from "../types";

type Props = {
  game: Game;
  showActions?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;
};

function gameTypeLabel(t: Game["gameType"]) {
  if (t === "1v1") return "1:1";
  if (t === "2v2") return "2:2";
  if (t === "2v2v2") return "2:2:2";
  if (t === "3v3") return "3:3";
  if (t === "3v3v3") return "3:3:3";
  return "기타";
}

function resultLabel(r: Game["result"]) {
  if (r === "WIN") return "승";
  if (r === "LOSE") return "패";
  if (r === "DRAW") return "무";
  return "기타";
}

function resultColor(r: Game["result"]): string {
  if (r === "WIN") return "green";
  if (r === "LOSE") return "red";
  if (r === "DRAW") return "gray";
  return "gray";
}

export default function GameCard({ game, showActions = true, onEdit, onDelete }: Props) {
  const avg = game.inning > 0 ? (game.score / game.inning).toFixed(3) : "-";

  // ✅ 숫자 컬럼 폭(모바일에서 흔들림 방지)
  const W = { inning: 32, score: 36, avg: 64, menu: 34 };

  return (
    <Card
      withBorder
      radius="md"
      p={0}
      style={{
        overflow: "hidden",
      }}
    >
      {/* ✅ List item row */}
      <div
        style={{
          padding: "10px 10px",
          display: "grid",
          gridTemplateColumns: "54px 1fr auto",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* left: game type */}
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" fw={900} style={{ whiteSpace: "nowrap" }}>
            {gameTypeLabel(game.gameType)}
          </Text>
        </div>

        {/* mid: stats inline */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
          <Num label="이닝" value={String(game.inning)} width={W.inning} />
          <Divider />
          <Num label="점수" value={String(game.score)} width={W.score} />
          <Divider />
          <Num label="AVG" value={avg} width={W.avg} strong />
        </div>

        {/* right: result + menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Badge
            size="sm"
            radius="sm"
            variant="light"
            color={resultColor(game.result)}
            style={{ fontWeight: 900 }}
          >
            {resultLabel(game.result)}
          </Badge>

          {showActions && (
            <div style={{ width: W.menu, display: "flex", justifyContent: "flex-end" }}>
              <Menu width={160} position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="더보기"
                  >
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                <Menu.Item
  leftSection={<IconPencil size={14} />}
  onClick={() => {
    console.log("[GameCard] edit clicked", game.id, !!onEdit); // ✅ true여야 정상
    onEdit?.(game);
  }}
>                    수정
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => onDelete?.(game.id)}
                  >
                    삭제
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function Num({
  label,
  value,
  width,
  strong,
}: {
  label: string;
  value: string;
  width: number;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        width,
        display: "grid",
        gap: 2,
        justifyItems: "end", // ✅ 오른쪽 정렬 유지
      }}
    >
      <Text fz={10} c="dimmed" fw={900} style={{ lineHeight: 1 }}>
        {label}
      </Text>

      <Text
        size="sm"
        fw={strong ? 900 : 800}
        style={{
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </Text>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 14, background: "var(--mantine-color-gray-3)" }} />;
}