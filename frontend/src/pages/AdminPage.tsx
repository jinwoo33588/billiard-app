import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Group, Loader, Stack, Table, Text, TextInput, Tabs, SegmentedControl, Select } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import Metric from "../shared/components/Metric";
import { fmt1, fmt3, fmtPct, fmtInt } from "../shared/utils/number";
import { fmtYYYYMMDD } from "../shared/utils/date";
import type { AdminOverview, AdminUserDashboard, AdminUserSummary } from "../features/admin/types";
import { getAdminOverviewApi, getAdminUserDashboardApi, listAdminUsersApi } from "../features/admin/admin.api";
import StatsSection from "../features/stats/components/StatsSection";
import StatsTabHeader, { type StatsTab } from "../features/stats/components/StatsTabHeader";
import GameList from "../features/games/components/GameList";
import HandicapScoreCard from "../features/insights/components/HandicapScoreCard";
import FormTrendCard from "../features/insights/components/FormTrendCard";
import StreakCard from "../features/insights/components/StreakCard";

export default function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AdminUserDashboard | null>(null);

  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [tab, setTab] = useState<StatsTab>("thisMonth");
  const [recentN, setRecentN] = useState(10);
  const [listMode, setListMode] = useState<"all" | "month" | "recent">("month");
  const [listRecent, setListRecent] = useState(10);
  const winThreshold = 0.65;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingOverview(true);
        const data = await getAdminOverviewApi();
        if (!mounted) return;
        setOverview(data);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "failed to load overview");
      } finally {
        if (mounted) setLoadingOverview(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingUsers(true);
        const list = await listAdminUsersApi({
          limit: 200,
          q: debouncedQ || undefined,
          mode: listMode,
          recentLimit: listRecent,
        });
        if (!mounted) return;
        const next = (list as AdminUserSummary[]).slice().sort((a, b) => {
          const ha = Number.isFinite(a.handicap) ? a.handicap : 0;
          const hb = Number.isFinite(b.handicap) ? b.handicap : 0;
          if (ha !== hb) return hb - ha; // ✅ 핸디 낮은 순
          return (a.nickname || "").localeCompare(b.nickname || "");
        });
        setUsers(next);
        if (!next.length) return;
        if (!selectedId || !next.some((u) => u.id === selectedId)) {
          setSelectedId(next[0].id);
        }
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "failed to load users");
      } finally {
        if (mounted) setLoadingUsers(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [debouncedQ, listMode, listRecent]);

  useEffect(() => {
    if (!selectedId) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingDashboard(true);
        setDashboard(null);
        const data = await getAdminUserDashboardApi(selectedId, { recent: recentN, insightsLimit: 20 });
        if (!mounted) return;
        setDashboard(data);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "failed to load user dashboard");
      } finally {
        if (mounted) setLoadingDashboard(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedId, recentN]);

  const pickedStats = useMemo(() => {
    if (!dashboard?.stats) return null;
    return tab === "all"
      ? { title: "전체", subtitle: "전체 기록 기준", stats: dashboard.stats.all }
      : tab === "thisMonth"
        ? { title: "이번달", subtitle: "이번달 기록 기준", stats: dashboard.stats.thisMonth }
        : { title: `최근 ${recentN}게임`, subtitle: `최근 ${recentN}판 기준`, stats: dashboard.stats.recent };
  }, [dashboard, tab]);

  const listWithExpected = useMemo(() => {
    const values = users
      .map((u) => (u.avg > 0 ? u.handicap / u.avg : Number.POSITIVE_INFINITY))
      .filter((v) => Number.isFinite(v))
      .sort((a, b) => a - b);
    const mid = values.length ? values[Math.floor(values.length / 2)] : Number.POSITIVE_INFINITY;

    return users.map((u) => {
      const expectedInnings = u.avg > 0 ? u.handicap / u.avg : Number.POSITIVE_INFINITY;
      let label: "유리" | "중간" | "불리" = "중간";
      if (Number.isFinite(expectedInnings)) {
        if (u.winRate >= winThreshold && expectedInnings <= mid) label = "유리";
        else if (u.winRate < winThreshold && expectedInnings >= mid) label = "불리";
      }
      return { ...u, expectedInnings, label };
    });
  }, [users, winThreshold]);

  return (
    <div style={{ padding: 12 }}>
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="nowrap">
          <div>
            <Text fw={950} style={{ letterSpacing: -0.3 }}>
              관리자 대시보드
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              전체 사용자/게임/지표를 빠르게 확인
            </Text>
          </div>
          <Badge variant="light" color="blue" radius="xl" style={{ fontWeight: 900 }}>
            Admin
          </Badge>
        </Group>

        <Card withBorder radius="md" p="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          {loadingOverview ? (
            <Group justify="center" py={16}>
              <Loader size="sm" />
            </Group>
          ) : overview ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <Metric label="총 사용자" value={fmtInt(overview.totalUsers)} strong />
              <Metric label="총 게임" value={fmtInt(overview.totalGames)} strong />
              <Metric label="이번달 게임" value={fmtInt(overview.gamesThisMonth)} strong />
              <Metric label="이번달 활동 유저" value={fmtInt(overview.activeUsersThisMonth)} strong />
            </div>
          ) : (
            <Text size="sm" c="dimmed">
              요약 정보를 불러오지 못했습니다.
            </Text>
          )}
        </Card>

        <Card withBorder radius="md" p="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          <Group justify="space-between" align="center" mb={8} wrap="nowrap">
            <Text fw={900}>사용자 목록</Text>
            <Group gap={8} wrap="nowrap">
              <SegmentedControl
                size="xs"
                value={listMode}
                onChange={(v) => setListMode(v as "all" | "month" | "recent")}
                data={[
                  { label: "전체", value: "all" },
                  { label: "이번달", value: "month" },
                  { label: "최근", value: "recent" },
                ]}
              />
              {listMode === "recent" ? (
                <Select
                  size="xs"
                  value={String(listRecent)}
                  onChange={(v) => setListRecent(Number(v || 10))}
                  data={[
                    { value: "10", label: "최근 10" },
                    { value: "20", label: "최근 20" },
                    { value: "30", label: "최근 30" },
                  ]}
                  styles={{ input: { width: 110 } }}
                />
              ) : null}
              <TextInput
                value={q}
                onChange={(e) => setQ(e.currentTarget.value)}
                placeholder="닉네임/이메일 검색"
                leftSection={<IconSearch size={14} />}
                styles={{ input: { width: 200 } }}
                size="xs"
              />
            </Group>
          </Group>

          {loadingUsers ? (
            <Group justify="center" py={12}>
              <Loader size="sm" />
            </Group>
          ) : users.length ? (
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                style={{ whiteSpace: "nowrap", minWidth: 980 }}
              >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>닉네임</Table.Th>
                  <Table.Th>핸디</Table.Th>
                  <Table.Th>게임수</Table.Th>
                  <Table.Th>승/무/패</Table.Th>
                  <Table.Th>AVG</Table.Th>
                  <Table.Th>승률</Table.Th>
                  <Table.Th>예상이닝</Table.Th>
                  <Table.Th>평가</Table.Th>
                  <Table.Th>최근 경기</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {listWithExpected.map((u) => (
                  <Table.Tr
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    style={{ cursor: "pointer", background: u.id === selectedId ? "rgba(72,149,255,0.08)" : undefined }}
                  >
                      <Table.Td>
                        <Text fw={900}>{u.nickname}</Text>
                        <Text size="xs" c="dimmed">
                          {u.email}
                        </Text>
                      </Table.Td>
                      <Table.Td>{u.handicap}</Table.Td>
                      <Table.Td>{u.gamesCount}</Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={900} style={{ fontVariantNumeric: "tabular-nums" }}>
                          {u.wins}승 {u.draws}무 {u.loses}패
                        </Text>
                      </Table.Td>
                      <Table.Td>{fmt3(u.avg)}</Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={900} style={{ fontVariantNumeric: "tabular-nums" }}>
                          {fmtPct(u.winRate, 0)}%
                        </Text>
                        <Text size="xs" c="dimmed" fw={800}>
                          기대승률 {fmtPct(u.expectedWinRate, 0)}%
                        </Text>
                      </Table.Td>
                      <Table.Td>{Number.isFinite(u.expectedInnings) ? fmt1(u.expectedInnings) : "-"}</Table.Td>
                      <Table.Td>
                        <Badge
                          size="xs"
                          radius="xl"
                          variant="light"
                          color={u.label === "유리" ? "teal" : u.label === "불리" ? "red" : "gray"}
                        >
                          {u.label}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{u.lastGameDate ? fmtYYYYMMDD(u.lastGameDate) : "-"}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
              </Table>
            </div>
          ) : (
            <Text size="sm" c="dimmed">
              사용자 데이터가 없습니다.
            </Text>
          )}
        </Card>

        <Card withBorder radius="md" p="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          <Group justify="space-between" align="center" mb={8} wrap="nowrap">
            <div>
              <Text fw={900}>유저 탭</Text>
              <Text size="xs" c="dimmed" mt={4}>
                탭을 눌러 해당 유저의 stats / games / insights를 확인
              </Text>
            </div>
            {selectedId ? (
              <Badge variant="light" color="blue" radius="xl">
                선택: {users.find((u) => u.id === selectedId)?.nickname ?? "-"}
              </Badge>
            ) : null}
          </Group>

          {users.length ? (
            <Tabs value={selectedId ?? undefined} onChange={setSelectedId} variant="pills">
              <Tabs.List style={{ flexWrap: "nowrap", overflowX: "auto", gap: 6 }}>
                {users.map((u) => (
                  <Tabs.Tab key={u.id} value={u.id}>
                    {u.nickname}
                  </Tabs.Tab>
                ))}
              </Tabs.List>

              {selectedId ? (
                <Tabs.Panel value={selectedId} pt="sm">
                  {loadingDashboard ? (
                    <Group justify="center" py={12}>
                      <Loader size="sm" />
                    </Group>
                  ) : dashboard ? (
                    <Stack gap="sm">
                      <Card withBorder radius="md" p="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                        <Group justify="space-between" align="center" wrap="nowrap">
                          <div>
                            <Text fw={900}>{dashboard.user.nickname}</Text>
                            <Text size="xs" c="dimmed">
                              핸디 {dashboard.user.handicap} · 최근 {recentN}게임
                            </Text>
                          </div>
                          <Badge variant="light" color="gray">
                            {dashboard.stats.recent.gamesCount}판
                          </Badge>
                        </Group>

                        <div style={{ marginTop: 12 }}>
                          <StatsTabHeader tab={tab} setTab={setTab} recentN={recentN} setRecentN={setRecentN} />
                          <div style={{ marginTop: 10 }}>
                            {pickedStats ? (
                              <StatsSection title={pickedStats.title} subtitle={pickedStats.subtitle} stats={pickedStats.stats} loading={false} />
                            ) : (
                              <Text size="sm" c="dimmed">통계 없음</Text>
                            )}
                          </div>
                        </div>
                      </Card>

                      <Card withBorder radius="md" p="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                        <Group justify="space-between" align="center" mb={8} wrap="nowrap">
                          <Text fw={900}>최근 게임</Text>
                          <Text size="xs" c="dimmed" fw={900}>
                            {dashboard.recentGames?.length ?? 0}판
                          </Text>
                        </Group>
                        <GameList games={dashboard.recentGames ?? []} showActions={false} />
                      </Card>

                      <Card withBorder radius="md" p="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
                        <Text fw={900} mb={8}>Insights</Text>
                        <Stack gap="sm">
                          <HandicapScoreCard data={dashboard.insights} />
                          <FormTrendCard games={dashboard.recentGames ?? []} />
                          <StreakCard games={dashboard.recentGames ?? []} limit={30} />
                        </Stack>
                      </Card>
                    </Stack>
                  ) : (
                    <Text size="sm" c="dimmed">데이터 없음</Text>
                  )}
                </Tabs.Panel>
              ) : null}
            </Tabs>
          ) : (
            <Text size="sm" c="dimmed">
              사용자 데이터가 없습니다.
            </Text>
          )}
        </Card>

        {error ? (
          <Text size="sm" c="red">
            {error}
          </Text>
        ) : null}
      </Stack>
    </div>
  );
}
