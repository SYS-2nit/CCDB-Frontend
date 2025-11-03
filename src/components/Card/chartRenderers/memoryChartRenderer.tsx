import BarChart from "@/components/Chart/BarChart";
import GaugeChart from "@/components/Chart/GaugeChart";
import LineChart from "@/components/Chart/LineChart";

// Memory 탭 전용 차트 렌더러
export const memoryChartRenderer = (title: string) => {
  if (title.includes("PGA Utilization (%) - Current")) return <GaugeChart />;
  if (title.includes("SGA Utilization (%) - Current")) return <GaugeChart />;
  if (title.includes("PGA Utilization (%) - Trend"))
    return (
      <LineChart
        legends={["PGA Used"]}
        seriesData={[[40, 45, 48, 42, 44, 50, 55]]}
        yaxisTitle="Utilization (%)"
      />
    );

  if (title.includes("SGA Composition (%) - Trend"))
    return (
      <LineChart
        legends={["Buffer Cache", "Shared Pool"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        yaxisTitle="SGA Ratio (%)"
      />
    );
  if (title.includes("Workarea Spill Rate (%) - Trend"))
    return (
      <LineChart
        legends={["Buffer Cache", "Shared Pool"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        yaxisTitle="SGA Ratio (%)"
      />
    );
  if (title.includes("Library Cache Reloads per Second - Trend"))
    return (
      <LineChart
        legends={["Buffer Cache", "Shared Pool"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        yaxisTitle="SGA Ratio (%)"
      />
    );
  if (title.includes("Buffer Cache Miss Rate (%) - Proxy - Trend"))
    return (
      <LineChart
        legends={["Buffer Cache", "Shared Pool"]}
        seriesData={[
          [50, 52, 53, 55, 54, 56, 58],
          [30, 32, 31, 29, 30, 31, 30],
        ]}
        yaxisTitle="SGA Ratio (%)"
      />
    );

  /** Top SQL by Shared Pool Memory */
  if (title.includes("Top SQL by Shared Pool Memory"))
    return (
      <BarChart
        legends={["Sharable Memory (bytes)"]}
        seriesData={[[520, 410, 340]]} // sharable_mem (bytes) 값만 시각화
        categories={["SQL_ID 240", "SQL_ID 180", "SQL_ID 130"]}
        xaxisTitle="Sharable Memory (bytes)"
        horizontal={true}
        colors={["#0EA5E9"]}
      />
    );

  // 기본값
  return <LineChart />;
};
