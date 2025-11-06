import LineChart from "@/components/Chart/LineChart";
import MetricCard from "@/components/Card/MetricCard";
import StackChart from "@/components/Chart/StackChart";
import { getCssVar } from "@/styles/utils/getCssVar";

/** CPU 탭 전용 차트 렌더러 */
export const cpuChartRenderer = (title: string) => {
  if (title.includes("CPU 활동 현황 타일"))
    return (
      <MetricCard
        metrics={[
          { title: "Host CPU(%)", value: "73.8", subtitle: "5.9 / 8 cores" },
          {
            title: "DB CPU Saturation(%)",
            value: "46.3",
            subtitle: "3.7 / 8 sessions",
          },
          {
            title: "DB Share of Host(%)",
            value: "62.7",
            subtitle: "3.7 / 5.9 cores",
          },
          {
            title: "Run Queue per Core(process)",
            value: "1.3",
            subtitle: "runnables/core",
          },
          { title: "TPS", value: "284", subtitle: "txn/s" },
          { title: "EXEC/S", value: "1.4", subtitle: "exec/s" },
          { title: "USER CALLS/S", value: "5.2", subtitle: "calls/s" },
        ]}
        columns={7}
        height={110}
      />
    );

  if (title.includes("Foreground vs Background CPU 추이 (AAS)"))
    return (
      <LineChart
        seriesData={[
          [2.1, 2.3, 2.0, 2.5, 2.8, 3.0],
          [1.5, 1.6, 1.7, 1.8, 1.9, 2.1],
        ]}
        categories={["00:00", "02:00", "04:00", "06:00", "08:00", "10:00"]}
        height={140}
      />
    );

  if (title.includes("Host CPU Utilization (%)"))
    return (
      <LineChart
        legends={["Host_CPU_Util_Pct "]}
        seriesData={[[40, 45, 48, 42, 44, 50, 55]]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        height={140}
      />
    );

  if (title.includes("DB CPU Saturation - AAS vs Core (Load)"))
    return (
      <LineChart
        legends={["AAS_OnCPU_Sessions", "Core_Baseline_Sessions"]}
        seriesData={[
          [10, 15, 20, 18, 22, 25, 30],
          [40, 45, 48, 42, 44, 50, 55],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        height={140}
      />
    );

  if (title.includes("DB CPU Share of Host (%)"))
    return (
      <LineChart
        legends={["DB_of_Host_Share_Pct", "Other processes"]}
        seriesData={[
          [10, 15, 20, 18, 22, 25, 30],
          [40, 45, 48, 42, 44, 50, 55],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        height={140}
      />
    );

  if (title.includes("CPU Cost per Commit/Execution (ms)"))
    return (
      <LineChart
        legends={["CPU_per_Commit", "CPU_per_Exec"]}
        seriesData={[
          [20, 30, 40, 45, 50],
          [25, 28, 35, 42, 47],
        ]}
        categories={["1m", "2m", "3m", "4m", "5m"]}
        height={140}
      />
    );

  if (title.includes("Run Queue per Core - Scheduler Load (%)"))
    return (
      <LineChart
        legends={[
          "RunQ_per_Core",
          "Load_threshold",
          "Load_threshold_min",
          "Load_threshold_max",
        ]}
        seriesData={[
          [20, 30, 40, 45, 50],
          [25, 28, 35, 42, 47],
          [10, 15, 20, 18, 22],
          [50, 55, 60, 65, 70],
        ]}
        categories={["1m", "2m", "3m", "4m", "5m"]}
        height={140}
      />
    );

  if (title.includes("Top SQL by CPU (Last 10 min)"))
    return (
      <StackChart
        labels={[
          "SQL_ID 100",
          "SQL_ID 200",
          "SQL_ID 300",
          "SQL_ID 400",
          "SQL_ID 500",
        ]}
        usage={[4789, 367, 842, 2362, 1530]}
        total={[5000, 4000, 4000, 3000, 2000]}
        colorRules={[{ min: 0, max: 100, color: getCssVar("main-500") }]}
        tooltipFormatter={({ used, total, percent }) =>
          `CPU Time (ms): ${used.toLocaleString()}ms / Total: ${total.toLocaleString()}ms (${percent.toFixed(
            1
          )}%)`
        }
      />
    );

  /** 기본 */
  return <LineChart height={140} />;
};
