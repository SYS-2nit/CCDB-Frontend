import GaugeChart from "@/components/Chart/GaugeChart";
import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
import { getCssVar } from "@/styles/utils/getCssVar";
import "./ChartRenderer.scss";
import MetricCard from "../MetricCard";

// Memory 탭 전용 차트 렌더러
export const memoryChartRenderer = (title: string) => {
  if (title.includes("SGA Efficiency & Memory Pools"))
    return (
      <>
        {/* 오른쪽: 메트릭 */}
        <MetricCard
          metrics={[
            {
              title: "SGA Usage",
              value: "65%",
              subtitle: "Total 1.55 / Used 1.01 GB",
            },
            {
              title: "Shared Pool",
              value: "65%",
              subtitle: "Total 1.55 / Used 1.01 GB",
            },
            { title: "Lib.Cache", value: "0.00 Byte", subtitle: "" },
            { title: "Dic.Cache", value: "7.23 MB", subtitle: "" },
            { title: "Large Pool", value: "24.19 MB", subtitle: "" },
            { title: "Java Pool", value: "16.00 MB", subtitle: "" },
            { title: "Log Buffer", value: "6.80 MB", subtitle: "" },
            { title: "Buffer Cache", value: "352.00 MB", subtitle: "" },
          ]}
          columns={8}
          height={110}
        />
      </>
    );

  if (title.includes("PGA Execution Memory & Processes"))
    return (
      <div className="chart-section">
        {/* 좌측: 게이지 2개 */}
        <div className="chart-grid">
          <div className="chart-item">
            <GaugeChart
              value={45.37}
              label="PGA Memory Usage"
              subLabel="Total 544 MB / Used 246 MB"
              size={135}
            />
          </div>

          <div className="chart-item">
            <GaugeChart
              value={100}
              label="Memory Sort"
              subLabel="완료된 정렬 메모리 100%"
              size={135}
              color="#22C55E"
            />
          </div>
        </div>

        {/* 우측: 메트릭 */}
        <MetricCard
          metrics={[
            { title: "Dedicated", value: 178, subtitle: "" },
            { title: "Parallel", value: 0, subtitle: "" },
            { title: "Shared", value: 1, subtitle: "" },
            { title: "Dispatcher", value: 1, subtitle: "" },
            { title: "Job", value: 3, subtitle: "" },
          ]}
          columns={5}
          height={100}
        />
      </div>
    );

  if (title.includes("Workarea Spill Rate (%)"))
    return (
      <LineChart
        legends={["Spill_Rate_Pct"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        height={140}
      />
    );
  if (title.includes("Library Cache Reloads per Second"))
    return (
      <LineChart
        legends={["Libcache_Reload_per_s"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        height={140}
      />
    );
  if (title.includes("Buffer Cache Miss Rate (%) - Proxy "))
    return (
      <LineChart
        legends={["Buffer_Miss_Pct"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        height={140}
      />
    );

  if (title.includes("Top SQL by Shared Pool Memory"))
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
          `Sharable Memory (bytes): ${used.toLocaleString()}ms / Total: ${total.toLocaleString()}ms (${percent.toFixed(
            1
          )}%)`
        }
      />
    );

  // 기본값
  return <LineChart height={140} />;
};
