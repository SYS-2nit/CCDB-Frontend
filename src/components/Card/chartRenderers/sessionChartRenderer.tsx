import BarChart from "@/components/Chart/BarChart";
import LineChart from "@/components/Chart/LineChart";
import TableChart from "@/components/Chart/TableChart";
import MetricCard from "@/components/Card/MetricCard";

// Session 탭 전용 차트 렌더러
export const sessionChartRenderer = (title: string) => {
  if (title.includes("Now Tiles"))
    return (
      <MetricCard
        metrics={[
          { title: "total_user_sessions_now", value: 324 },
          { title: "blocker_count_now", value: 2 },
          { title: "blocked_sessions_now", value: 11 },
        ]}
        columns={3}
      />
    );

  if (title.includes("Long-Idle Sessions ≥10/30/60m — Snapshot"))
    return (
      <BarChart
        barCount={3}
        categories={["idle_10m", "idle_30m", "idle_60m"]}
        data={[72, 41, 9]}
        yaxisTitle="Sessions (count)"
        xaxisTitle="Idle Duration"
        colors={["#F1C40F", "#7FA4FA", "#75E093"]}
      />
    );
  if (title.includes("Blocking — Blocker vs Blocked Sessions — Trend"))
    return (
      <LineChart
        legends={["blocker_count", "blocked_sessions"]}
        seriesData={[
          [10, 15, 20, 18, 22, 25, 30],
          [40, 45, 48, 42, 44, 50, 55],
        ]}
        yaxisTitle="Sessions"
      />
    );
  if (title.includes("Lock Wait Sessions — TX vs TM vs Total"))
    return (
      <LineChart
        legends={["lock_wait_tx", "lock_wait_tm", "lock_wait_total"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        yaxisTitle="SGA Ratio (%)"
      />
    );
  if (title.includes("Active vs Inactive Sessions — Trend"))
    return (
      <LineChart
        legends={["active_sessions", "inactive_sessions"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        yaxisTitle="SGA Ratio (%)"
      />
    );
  if (title.includes("Top Blocker Sessions — Snapshot Top 5"))
    return (
      <TableChart
        columns={[
          "inst_id",
          "blocker_sid",
          "victims",
          "max_seconds_in_wait(s)",
          "top_event",
          "blocker_username",
          "blocker_program",
          "blocker_sql_id",
        ]}
        rows={[
          [1, 240, 35, 520, 12_340, 25_600, 0, 0],
          [2, 180, 22, 410, 9_580, 18_320, 0, 0],
          [3, 130, 18, 340, 7_210, 14_850, 0, 0],
        ]}
      />
    );
  return <LineChart />;
};
