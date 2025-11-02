import BarChart from "@/components/Chart/BarChart";
import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
import TableChart from "@/components/Chart/TableChart";
import MetricCard from "@/components/Card/MetricCard";

// Session 탭 전용 차트 렌더러
export const sessionChartRenderer = (title: string) => {
  /** 세션 활동·자원 현황 */
  if (
    title.includes("Session Activity") ||
    title.includes("세션 활동") ||
    title.includes("자원 현황")
  )
    return (
      <MetricCard
        metrics={[
          { title: "Active / Total Users (/240)", value: "37" },
          { title: "Sessions Limit Util (%)", value: "53.2" },
          { title: "Processes Limit Util (%)", value: "59.3" },
          { title: "Blockers (now)", value: 7 },
          { title: "Blocked (now)", value: 12 },
        ]}
        columns={3}
      />
    );

  /** Long-Idle Sessions ≥10/30/60m — Snapshot */
  if (title.includes("Long-Idle Sessions"))
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

  /** Blocking — Blocker vs Blocked Sessions — Trend */
  if (title.includes("Blocking"))
    return (
      <LineChart
        legends={["Blocker Sessions", "Blocked Sessions"]}
        seriesData={[
          [10, 15, 20, 18, 22, 25, 30],
          [40, 45, 48, 42, 44, 50, 55],
        ]}
        categories={["00:00", "02:00", "04:00", "06:00", "08:00", "10:00"]}
        yaxisTitle="Sessions"
      />
    );

  /** Lock Wait Sessions — TX vs TM vs Total */
  if (title.includes("Lock Wait Sessions"))
    return (
      <LineChart
        legends={["TX Lock Waits", "TM Lock Waits", "Lock Wait Total"]}
        seriesData={[
          [5, 6, 5, 8, 7, 9, 6],
          [3, 4, 3, 4, 5, 5, 4],
          [8, 9, 8, 10, 9, 10, 8],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Wait Sessions (count)"
      />
    );

  /** Active vs Inactive Sessions — Trend */
  if (title.includes("Active vs Inactive Sessions"))
    return (
      <LineChart
        legends={["Active Sessions", "Inactive Sessions"]}
        seriesData={[
          [40, 38, 35, 36, 37, 40, 41],
          [20, 19, 18, 19, 21, 20, 19],
        ]}
        categories={["00:00", "02:00", "04:00", "06:00", "08:00", "10:00"]}
        yaxisTitle="Sessions (count)"
      />
    );

  /** On-CPU vs Wait (AAS 분해) — Trend */
  if (title.includes("On-CPU vs Wait"))
    return (
      <StackChart
        legends={["On-CPU Sessions", "Wait Sessions"]}
        seriesData={[
          [2.5, 3.0, 3.2, 3.5, 3.0, 2.8],
          [1.5, 2.0, 2.1, 1.8, 2.3, 2.0],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Average Active Sessions (AAS)"
      />
    );

  /** Exec/s — Trend */
  if (title.includes("Exec/s"))
    return (
      <LineChart
        legends={["Exec per Second"]}
        seriesData={[[100, 150, 200, 250, 220, 270, 230]]}
        categories={["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"]}
        yaxisTitle="Executions per Second"
      />
    );

  /** Logons/sec & Disconnects/sec — Trend */
  if (title.includes("Logons/sec"))
    return (
      <LineChart
        legends={["Logons/sec", "Disconnects/sec"]}
        seriesData={[
          [10, 20, 15, 25, 30, 22, 18],
          [5, 10, 8, 12, 15, 11, 9],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Sessions per Second"
      />
    );

  /** Top Blocker Sessions — Snapshot Top 5 */
  if (title.includes("Top Blocker Sessions"))
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
          [
            1,
            3289,
            11,
            243,
            "enq: TX - row lock contention",
            "APPUSER",
            "app-batch.jar",
            "6pft6aymn3d2j",
          ],
          [
            2,
            517,
            7,
            198,
            "enq: TM - contention",
            "APPUSER",
            "web-node-12",
            "91kc1u2dr7c1m",
          ],
          [
            3,
            1407,
            6,
            121,
            "library cache lock",
            "REPORT",
            "sqlplus.exe",
            "7n4sa80jc7lm1",
          ],
          [
            4,
            205,
            4,
            84,
            "log file switch",
            "ERP",
            "erp-elt.sh",
            "5d8h2s0bg8avt8g",
          ],
          [
            5,
            911,
            3,
            79,
            "cursor pin s wait on X",
            "BI",
            "bi-svc",
            "4dp1m9ltg6dv2",
          ],
        ]}
      />
    );

  // 기본
  return <LineChart />;
};
