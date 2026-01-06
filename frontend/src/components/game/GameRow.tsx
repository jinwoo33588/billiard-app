import React from "react";
import { Card, Group, Text, Badge, ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import type { Game } from "../../features/games/types";
import { resultColor, resultLabel, gameTypeLabel } from "../../features/games/label";

type Props = {
  game: Game;
  showActions?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;
  onClick?: (game: Game) => void;
};

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export default function GameRow({ game, showActions = false, onEdit, onDelete, onClick }: Props) {
  const avg = game.inning > 0 ? (game.score / game.inning).toFixed(3) : "-";

  const W = { result: 44, inning: 36, avg: 72, score: 36, actions: 34 };

  return (
    <Card withBorder radius="md" p="sm" style={{ cursor: onClick ? "pointer" : "default" }} onClick={() => onClick?.(game)}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text fw={700} size="sm" style={{ whiteSpace: "nowrap" }}>
            {formatShortDate(game.gameDate)}
          </Text>
          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {gameTypeLabel(game.gameType)}
          </Text>
        </div>

        <Group gap={0} wrap="nowrap" align="center">
          <div style={{ width: W.result, display: "flex", justifyContent: "center" }}>
            <Badge color={resultColor(game.result)} variant="light" radius="sm" size="lg">
              {resultLabel(game.result)}
            </Badge>
          </div>

          <Text size="sm" style={{ width: W.inning, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {game.inning}
          </Text>

          <Text size="sm" style={{ width: W.score, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {game.score}
          </Text>

          <Text size="sm" fw={800} style={{ width: W.avg, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {avg}
          </Text>

          {showActions && (
            <div style={{ width: W.actions, display: "flex", justifyContent: "flex-end" }}>
              <Menu width={180} position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" onClick={(e) => e.stopPropagation()}>
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                  <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit?.(game)}>
                    수정
                  </Menu.Item>
                  <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => onDelete?.(game._id)}>
                    삭제
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          )}
        </Group>
      </Group>
    </Card>
  );
}