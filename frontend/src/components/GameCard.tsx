import React from 'react';
import { Card, Text, Group, ActionIcon, Menu, Stack, Badge, SimpleGrid } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconTrophy,
  IconClock,
  IconNumber,
  IconChartBar,
} from '@tabler/icons-react';

export interface Game {
  _id: string;
  score: number;
  inning: number;
  result: '승' | '무' | '패';
  gameType: string;
  gameDate: string;
  memo?: string;
}

type Variant = 'normal' | 'compact';

type Props = {
  game: Game;
  variant?: Variant;

  showActions?: boolean;
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;

  onClick?: (game: Game) => void;
};

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Group gap={10} align="center" wrap="nowrap">
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(0,0,0,0.05)',
          flex: '0 0 auto',
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <Text size="xs" c="dimmed" lh={1.1}>
          {label}
        </Text>
        <Text fw={800} lh={1.1} style={{ fontSize: 15 }}>
          {value}
        </Text>
      </div>
    </Group>
  );
}

export default function GameCard({
  game,
  variant = 'normal',
  showActions = false,
  onEdit,
  onDelete,
  onClick,
}: Props) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const avg = game.inning > 0 ? (game.score / game.inning).toFixed(3) : 'N/A';

  const isCompact = variant === 'compact';

  const cardPadding = isCompact ? 'sm' : 'md';

  // ✅ 모바일 2x2 지표(아이콘 + 값)
  const MobileStats = (
    <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs" mt="sm">
      <StatTile icon={<IconTrophy size={18} />} label="결과" value={game.result} />
      <StatTile icon={<IconClock size={18} />} label="이닝" value={game.inning} />
      <StatTile icon={<IconNumber size={18} />} label="점수" value={game.score} />
      <StatTile icon={<IconChartBar size={18} />} label="에버" value={avg} />
    </SimpleGrid>
  );

  // ✅ 데스크탑/큰 화면 지표 (기존 스타일 유지, compact면 텍스트 크기 줄임)
  const DesktopStats = (
    <Group justify="space-around" mt="md" mb="xs">
      <div>
        <Text size="sm" c="dimmed">
          결과
        </Text>
        <Text size={isCompact ? 'lg' : 'xl'} fw={800}>
          {game.result}
        </Text>
      </div>
      <div>
        <Text size="sm" c="dimmed">
          이닝
        </Text>
        <Text size={isCompact ? 'lg' : 'xl'} fw={800}>
          {game.inning}
        </Text>
      </div>
      <div>
        <Text size="sm" c="dimmed">
          점수
        </Text>
        <Text size={isCompact ? 'lg' : 'xl'} fw={800}>
          {game.score}
        </Text>
      </div>
      <div>
        <Text size="sm" c="dimmed">
          에버리지
        </Text>
        <Text size={isCompact ? 'lg' : 'xl'} fw={800}>
          {avg}
        </Text>
      </div>
    </Group>
  );

  return (
    <Card
      withBorder
      radius="md"
      p={cardPadding}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 120ms ease, box-shadow 120ms ease',
      }}
      onClick={() => onClick?.(game)}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') onClick(game);
      }}
      tabIndex={onClick ? 0 : -1}
    >
      {/* 헤더 */}
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <Group gap={8}>
            <Text fw={800} style={{ fontSize: isCompact ? 14 : 16 }}>
              {new Date(game.gameDate).toLocaleDateString('ko-KR')}
            </Text>

            {/* compact일 때는 타입을 Badge로 붙여서 정보 밀도 높이기 */}
            {isCompact ? (
              <Badge size="sm" variant="light">
                {game.gameType}
              </Badge>
            ) : null}
          </Group>

          {!isCompact && (
            <Text size="sm" c="dimmed">
              {game.gameType}
            </Text>
          )}
        </Stack>

        {showActions && (
          // ✅ 메뉴 클릭이 카드 onClick으로 전파되지 않게 stopPropagation 처리
          <Menu width={180} position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={(e) => e.stopPropagation()}
              >
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
        )}
      </Group>

      {/* 본문 지표 */}
      {isMobile ? MobileStats : DesktopStats}

      {/* 메모 */}
      {game.memo && !isCompact && (
        <Text mt="sm" size="sm" c="dimmed" lineClamp={2}>
          메모: {game.memo}
        </Text>
      )}

      {/* compact에서는 메모를 한 줄로만(선택) */}
      {game.memo && isCompact && (
        <Text mt="sm" size="xs" c="dimmed" lineClamp={1}>
          {game.memo}
        </Text>
      )}
    </Card>
  );
}