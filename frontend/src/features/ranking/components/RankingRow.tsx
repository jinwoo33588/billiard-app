import React from "react";
import { Badge, Group, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import type { RankingItem } from "../types";
import { badgeFromWinRate } from "../../../shared/utils/formBadges";
import { fmt3, fmtPct } from "../../../shared/utils/number";
import { Tooltip } from "@mantine/core";


export default function RankingRow({
  item,
  myUserId,
  variant = "list",
}: {
  item: RankingItem;
  myUserId: string | null;
  variant?: "list" | "meCard";
}) {
  const navigate = useNavigate(); // ✅ 추가

  const isMe = !!myUserId && item.user.id === myUserId;
  const border =
    variant === "meCard"
      ? "2px solid rgba(0,0,0,0.28)"
      : isMe
      ? "2px solid rgba(0,0,0,0.22)"
      : "1px solid rgba(0,0,0,0.08)";

  const bg =
    variant === "meCard"
      ? "rgba(255,255,255,1)"
      : isMe
      ? "rgba(255,255,255,0.98)"
      : "rgba(255,255,255,0.92)";

  const name = item.user.nickname || item.user.name || item.user.id.slice(0, 6);
  const h = item.user.handicap ?? null;

  const games = item.stats.gamesCount ?? 0;
  const avg = games > 0 ? item.stats.avg : NaN;
  const win = games > 0 ? item.stats.winRate : NaN;
  const winPct = fmtPct(win, 0, "-");

  const winBadge = badgeFromWinRate(games > 0 ? item.stats.winRate : null);

  const goProfile = () => {
    navigate(`/users/${item.user.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goProfile}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") goProfile();
      }}
      style={{
        padding: "10px 10px",
        borderRadius: 14,
        border,
        background: bg,
        boxShadow:
          variant === "meCard"
            ? "0 10px 24px rgba(0,0,0,0.08)"
            : isMe
            ? "0 6px 18px rgba(0,0,0,0.06)"
            : undefined,
        position: "relative",
        display: "grid",
        gridTemplateColumns: "44px 1fr auto",
        alignItems: "center",
        gap: 10,

        cursor: "pointer",              // ✅ 추가
        userSelect: "none",             // ✅ 추가(선택)
        transition: "transform 120ms ease, box-shadow 120ms ease", // ✅ 추가
      }}
      onMouseDown={(e) => {
        // 모바일에서 “길게 눌러 드래그 선택” 같은 거 줄이기(선택)
        e.preventDefault();
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {isMe ? (
        <Badge
          radius="xl"
          variant="filled"
          style={{
            fontWeight: 900,
            position: "absolute",
            top: -8,
            left: -8,
            boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
            pointerEvents: "none",
          }}
        >
          ME
        </Badge>
      ) : null}
      {/* rank */}
      <div style={{ textAlign: "center" }}>
        <Text fw={950} style={{ fontVariantNumeric: "tabular-nums" }}>
          {item.rank}
        </Text>
      </div>

      {/* user */}
      <div style={{ minWidth: 0 }}>
        <Group gap={8} wrap="nowrap">
          <Text fw={950} style={{ lineHeight: 1.1 }} lineClamp={1}>
            {name}
          </Text>

          {h !== null ? (
            <Badge
              radius="xl"
              variant="light"
              style={{ border: "1px solid rgba(0,0,0,0.08)", fontWeight: 900 }}
              onClick={(e) => e.stopPropagation()} // ✅ 혹시라도 배지 눌렀을 때 row 클릭 막고 싶으면
            >
               {h}점
            </Badge>
          ) : null}
          {/* ✅ 승률 배지 */}
          <Tooltip label={winBadge.hint} withArrow>
    <Badge
      radius="xl"
      variant="light"
      color={winBadge.color}
      style={{ border: "1px solid rgba(0,0,0,0.08)", fontWeight: 900 }}
    >
      {winBadge.label}
      
    </Badge>
  </Tooltip>

        </Group>
     
         <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
          {games}판 · {item.stats.wins}승 {item.stats.draws}무 {item.stats.loses}패
        </Text> 
        
       
        
        
      </div>

      {/* stats */}
      <div style={{ textAlign: "right" }}>
        <Text size="xs" c="dimmed" fw={900} style={{ lineHeight: 1.1 }}>
          AVG / WIN
        </Text>
        <Text fw={950} style={{ fontVariantNumeric: "tabular-nums", lineHeight: 1.15 }}>
          {fmt3(avg)}
        </Text>
        <Text size="sm" fw={900} c="dimmed" style={{ fontVariantNumeric: "tabular-nums" }}>
          {winPct === "-" ? "-" : `${winPct}%`}
        </Text>
      </div>
    </div>
  );
}
