import { memo } from "react";
import { Card, Text, Badge, ActionIcon, Menu } from "@mantine/core";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import type { Game } from "../types";
import { getGameResultLabel, getGameResultTone, getGameTypeLabel } from "../../../shared/utils/gameLabels";
import { fmt0, fmt1, fmt3 } from "../../../shared/utils/number";
import { calcAvg } from "../../../shared/utils/gameMath";

type Props = {
  game: Game;
  showActions?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;
  opened?: boolean;
  onToggle?: (gameId: string) => void;
};

function GameCardBase({
  game,
  showActions = true,
  onEdit,
  onDelete,
  opened = false,
  onToggle,
}: Props) {
  const avg = fmt3(calcAvg(game.score, game.inning));
  const tone = getGameResultTone(game.result);

  const rating = game.rating;
  const expectedAvg = game.expectedAvg;
  const handicapUsed = game.handicapUsed;
  const canToggle = !!onToggle;

  // ✅ 숫자 컬럼 폭(모바일에서 흔들림 방지)
  const W = { inning: 32, score: 36, avg: 64, menu: 34 };

  return (
    <Card
      withBorder
      radius="md"
      p={0}
      style={{
        overflow: "hidden",
        borderColor: opened ? "rgba(217, 217, 217, 0.35)" : "rgba(0,0,0,0.06)",
        boxShadow: opened
          ? "0 14px 32px rgba(255, 255, 255, 0.18)"
          : "0 8px 20px rgba(0,0,0,0.04)",
        background: "rgba(255,255,255,0.98)",
        transition: "box-shadow 180ms ease, border-color 180ms ease, background 180ms ease",
        position: "relative",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 4,
          background: tone.accent,
          pointerEvents: "none",
        }}
      />
      {/* ✅ List item row */}
      <div
        role={canToggle ? "button" : undefined}
        tabIndex={canToggle ? 0 : undefined}
        onClick={canToggle ? () => onToggle?.(game.id) : undefined}
        onKeyDown={
          canToggle
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") onToggle?.(game.id);
              }
            : undefined
        }
        style={{
          padding: "10px 10px",
          display: "grid",
          gridTemplateColumns: "54px 1fr auto",
          alignItems: "center",
          gap: 10,
          cursor: canToggle ? "pointer" : undefined,
          background:
            "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,251,255,0.95) 100%)",
        }}
      >
        {/* left: game type */}
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" fw={900} style={{ whiteSpace: "nowrap" }}>
            {getGameTypeLabel(game.gameType)}
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
            variant="filled"
            style={{
              fontWeight: 900,
              background: tone.badgeBg,
              color: tone.badgeText,
              border: `1px solid ${tone.badgeBorder}`,
              boxShadow: `0 6px 16px ${tone.badgeShadow}`,
              textShadow: "0 1px 1px rgba(0,0,0,0.12)",
              letterSpacing: -0.2,
            }}
          >
            {getGameResultLabel(game.result)}
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
                  >
                    수정
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

      {opened ? (
        <div
          style={{
            borderTop: "1px solid rgba(190, 190, 190, 0.25)",
            background: "rgba(255, 255, 255, 0.6)",
            padding: "12px 12px 14px",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ display: "grid", gap: 8 }}>
            <Text size="xs" c="dimmed" fw={900} style={{ letterSpacing: -0.2 }}>
              Rating 상세
            </Text>
            <div
              style={{
                display: "flex",
                flexWrap: "nowrap",
                gap: 16,
              }}
            >
              <DetailItem label="핸디" value={fmt0(handicapUsed)} />
              <DetailItem label="기대 AVG" value={fmt3(expectedAvg)} divider />
              <DetailItem label="RATING" value={fmt1(rating)} divider />
            </div>
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <Text size="xs" c="dimmed" fw={900} style={{ letterSpacing: -0.2 }}>
              메모
            </Text>
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {game.memo?.trim() ? game.memo : "메모 없음"}
            </Text>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

const GameCard = memo(GameCardBase);
GameCard.displayName = "GameCard";
export default GameCard;

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

function DetailItem({
  label,
  value,
  divider = false,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        paddingLeft: divider ? 12 : 0,
        borderLeft: divider ? "1px solid rgba(72, 149, 255, 0.25)" : undefined,
      }}
    >
      <Text size="xs" c="dimmed" fw={900} style={{ lineHeight: 1, letterSpacing: -0.2 }}>
        {label}
      </Text>
      <Text fw={900} style={{ fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {value}
      </Text>
    </div>
  );
}
