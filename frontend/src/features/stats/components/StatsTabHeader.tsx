// frontend/src/features/stats/components/StatsTabHeader.tsx
import { Group, SegmentedControl } from "@mantine/core";

export type StatsTab = "all" | "thisMonth" | "recent";

export default function StatsTabHeader({
  tab,
  setTab,
  recentN,
  setRecentN,
  recentOptions = [10, 20, 30],
}: {
  tab: StatsTab;
  setTab: (t: StatsTab) => void;

  recentN: number;
  setRecentN: (n: number) => void;

  recentOptions?: number[];
}) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap" gap="sm">
      {/* ✅ 메인 탭 */}
      <SegmentedControl
        value={tab}
        onChange={(v) => setTab(v as StatsTab)}
        fullWidth
        radius="xl"
        data={[
          { label: "전체", value: "all" },
          { label: "이번달", value: "thisMonth" },
          { label: "최근", value: "recent" },
        ]}
        classNames={{
          control: "statsTabControl",
          label: "statsTabLabel",
        }}
        styles={{
          root: {
            flex: 1,
            padding: 4,
            borderRadius: 999,
            background: "rgba(255,255,255,0.9)",
            border: "1px solid rgba(0,0,0,0.10)",
          },
          indicator: {
            borderRadius: 999,
            background: "rgba(0,0,0,0.92)",
            boxShadow: "0 10px 18px rgba(0,0,0,0.12)",
          },
          control: { border: 0, height: 40 },
          label: {
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 950,
            letterSpacing: "-0.2px",
            padding: "0 12px",
            color: "rgba(0,0,0,0.72)",
          },
        }}
      />

      {/* ✅ recent일 때만 N 선택 */}
      {tab === "recent" ? (
        <SegmentedControl
          size="xs"
          radius="xl"
          value={String(recentN)}
          onChange={(v) => setRecentN(Number(v))}
          data={recentOptions.map((n) => ({ label: String(n), value: String(n) }))}
          classNames={{
            control: "statsTabControl",
            label: "statsTabLabel",
          }}
          styles={{
            root: {
              padding: 3,
              borderRadius: 999,
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(0,0,0,0.08)",
            },
            indicator: { borderRadius: 999, background: "rgba(0,0,0,0.82)" },
            control: { border: 0, height: 34 },
            label: {
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              padding: "0 10px",
              minWidth: 34,
              color: "rgba(0,0,0,0.68)",
            },
          }}
        />
      ) : null}
    </Group>
  );
}
