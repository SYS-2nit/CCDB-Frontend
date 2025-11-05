import BarChart from "@/components/Chart/BarChart";
import LineChart from "@/components/Chart/LineChart";
import MetricCard from "@/components/Card/MetricCard";

// Session 탭 전용 차트 렌더러
export const sessionChartRenderer = (title: string) => {
  if (title.includes("Session Activity & Resource Summary"))
    return (
      <MetricCard
        metrics={[
          { title: "Active / Total Users", value: "37", subtitle: "37/240" },
          {
            title: "Sessions Limit Util(%)",
            value: "53.2",
            subtitle: "532/1000",
          },
          {
            title: "Processes Limit Util(%)",
            value: "59.3",
            subtitle: "712/1200",
          },
          {
            title: "Blockers(session)",
            value: 7,
            subtitle: "세션 막는 블로커 수",
          },
          {
            title: "Blocked(session)",
            value: 12,
            subtitle: "대기중인 세션 수",
          },
        ]}
        columns={6}
      />
    );

  if (title.includes("Active vs Inactive Sessions"))
    return (
      <LineChart
        legends={["active_sessions", "inactive_sessions"]}
        seriesData={[
          [40, 38, 35, 36, 37, 40, 41],
          [20, 19, 18, 19, 21, 20, 19],
        ]}
        categories={["00:00", "02:00", "04:00", "06:00", "08:00", "10:00"]}
      />
    );

  if (title.includes("Lock Wait Sessions — TX vs TM vs Total"))
    return (
      <LineChart
        legends={["lock_wait_tx", "lock_wait_tm", "lock_wait_total"]}
        seriesData={[
          [40, 38, 35, 36, 37, 40, 41],
          [20, 19, 18, 19, 21, 20, 19],
          [10, 9, 48, 39, 62, 37, 72],
        ]}
        categories={["00:00", "02:00", "04:00", "06:00", "08:00", "10:00"]}
      />
    );

  if (title.includes("TPS"))
    return (
      <LineChart
        legends={["TPS_COMMIT_PER_SEC"]}
        seriesData={[[40, 38, 35, 36, 37, 40, 41]]}
        categories={["00:00", "02:00", "04:00", "06:00", "08:00", "10:00"]}
      />
    );

  if (title.includes("On-CPU vs Wait (AAS 분해)"))
    return (
      <LineChart
        legends={["AAS_ONCPU_SESSIONS", "AAS_WAIT_SESSIONS"]}
        seriesData={[
          [100, 150, 200, 250, 220, 270, 230],
          [620, 120, 572, 477, 285, 825, 123],
        ]}
        categories={["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]}
      />
    );

  if (title.includes("Exec/s"))
    return (
      <LineChart
        legends={["EXEC_PER_SEC"]}
        seriesData={[[10, 20, 15, 25, 30, 22, 18]]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
      />
    );

  if (title.includes("Logons/sec & Disconnects/sec"))
    return (
      <LineChart
        legends={["LOGONS_PER_SEC", "DISCONNECTS_PER_SEC"]}
        seriesData={[
          [10, 20, 15, 25, 30, 22, 18],
          [5, 10, 8, 12, 15, 11, 9],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Sessions per Second"
      />
    );

  if (title.includes("Top Blocker Sessions — Snapshot Top 5"))
    return (
      <BarChart
        legends={["Max Seconds in Wait (s)"]}
        seriesData={[[11, 7, 6, 4, 3]]}
        categories={[
          "SID 3289 (APPUSER)",
          "SID 517 (APPUSER)",
          "SID 1407 (REPORT)",
          "SID 205 (ERP)",
          "SID 911 (BI)",
        ]}
        xaxisTitle="victims"
        horizontal={true}
        colors={["#F59E0B"]}
      />
    );

  // 기본
  return <LineChart />;
};
