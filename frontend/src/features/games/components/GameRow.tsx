// frontend/src/features/games/components/GameRow.tsx
import React from "react";
import { Card, Group, Text, Badge, ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import type { Game } from "../types";
import { resultColor, resultLabel, gameTypeLabel } from "../label";

import OutcomeBadge from "../../insights/components/OutcomeBadge";
import type { OutcomeCategory } from "../../insights/utils/teamOutcome";
import GameRowDetail, { type GameRowDetailData } from "./GameRowDetail";

type Props = {
  game: Game;
  showActions?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;

  // ✅ 추가: 펼침/상세/태그
  expanded?: boolean;
  onToggleExpand?: (game: Game) => void;

  outcome?: OutcomeCategory | null; // tag(배지)
  detail?: GameRowDetailData | null; // gps/expectedScore/memo
};

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

export default function GameRow({
  game,
  showActions = false,
  onEdit,
  onDelete,
  expanded = false,
  onToggleExpand,
  outcome = null,
  detail = null,
}: Props) {
  const avg = game.inning > 0 ? (game.score / game.inning).toFixed(3) : "-";

  const W = { result: 110, inning: 32, avg: 64, score: 32, actions: 34 };

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{ cursor: onToggleExpand ? "pointer" : "default" }}
      onClick={() => onToggleExpand?.(game)}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        {/* left */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text fw={700} size="sm" style={{ whiteSpace: "nowrap" }}>
            {formatShortDate(game.gameDate)}
          </Text>
          <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            {gameTypeLabel(game.gameType)}
          </Text>
        </div>

        {/* right */}
        <Group gap={0} wrap="nowrap" align="center">
          {/* result + outcome tag */}
          <div
            style={{
              width: W.result,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              alignItems: "center",
            }}
          >
            <Badge color={resultColor(game.result)} variant="light" radius="sm" size="lg">
              {resultLabel(game.result)}
            </Badge>
            {outcome && <OutcomeBadge value={outcome} size="sm" variant="light" />}
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
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ 카드 펼침 방지
                    }}
                  >
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ 카드 펼침 방지
                  }}
                >
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

      {/* ✅ 펼침 상세 */}
      {expanded && detail && (
        <div
          style={{
            marginTop: 10,
          }}
          onClick={(e) => {
            // 상세 영역 클릭이 다시 토글되는 걸 막고 싶으면 이거 유지
            e.stopPropagation();
          }}
        >
          <GameRowDetail detail={detail} />
        </div>
      )}
    </Card>
  );
}