import BarChart from "@/components/Chart/BarChart";
import LineChart from "@/components/Chart/LineChart";
import TableChart from "@/components/Chart/TableChart";
import MetricCard from "@/components/Card/MetricCard";

// Session 탭 전용 차트 렌더러
export const renderSessionChart = (title: string) => {
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

  if (title.includes("Long-Idle Sessions"))
    return (
      <BarChart
        barCount={3}
        categories={["idle_10m", "idle_30m", "idle_60m"]}
        data={[72, 41, 9]}
        yaxisTitle="Sessions(count)"
        xaxisTitle="Idle Duration"
        colors={["#F1C40F", "#7FA4FA", "#75E093"]}
      />
    );

  if (title.includes("Blocking"))
    return (
      <LineChart
        legends={["Blocker", "Blocked"]}
        seriesData={[
          [10, 15, 20, 18, 22, 25, 30],
          [40, 45, 48, 42, 44, 50, 55],
        ]}
        yaxisTitle="Sessions"
      />
    );

  if (title.includes("Top Blocker Sessions"))
    return (
      <TableChart
        columns={[
          "Rank",
          "SQL_ID",
          "Plan Hash_VALUE",
          "Parsing_Schema__Name",
          "Module",
          "Cpu_Time",
          "Executions",
          "Last_Active_TIme",
        ]}
        rows={[
          [1, 240, 35, 520, 12_340, 25_600, 0, 0, 0],
          [2, 180, 22, 410, 9_580, 18_320, 0, 0, 0],
        ]}
      />
    );

  return <LineChart />;
};
