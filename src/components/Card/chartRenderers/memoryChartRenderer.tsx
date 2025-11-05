import BarChart from "@/components/Chart/BarChart";
import LineChart from "@/components/Chart/LineChart";

// Memory 탭 전용 차트 렌더러
export const memoryChartRenderer = (title: string) => {
  if (title.includes("PGA Execution Memory & Processes"))
    return (
      <>
        <div>게이지 + 바 + 메트릭</div>
      </>
    );
  if (title.includes("SGA Efficiency & Memory Pools"))
    return (
      <>
        <div>게이지 + 바 + 메트릭</div>
      </>
    );
  if (title.includes("PGA Utilization (%)"))
    return (
      <LineChart
        legends={["pga_used_pct"]}
        seriesData={[[40, 45, 48, 42, 44, 50, 55]]}
      />
    );

  if (title.includes("Workarea Spill Rate (%)"))
    return (
      <LineChart
        legends={["Spill_Rate_Pct"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
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
      />
    );

  if (title.includes("Top SQL by Shared Pool Memory"))
    return (
      <BarChart
        legends={["Sharable Memory (bytes)"]}
        seriesData={[[520, 410, 340]]}
        categories={["SQL_ID 240", "SQL_ID 180", "SQL_ID 130"]}
        horizontal={true}
        colors={["#0EA5E9"]}
      />
    );

  // 기본값
  return <LineChart />;
};
