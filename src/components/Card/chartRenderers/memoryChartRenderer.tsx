import GaugeChart from "@/components/Chart/GaugeChart";
import LineChart from "@/components/Chart/LineChart";

// Memory 탭 전용 차트 렌더러
export const renderMemoryChart = (title: string) => {
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
  if (title.includes("Workarea Spill Rate (%) - Trend")) return <GaugeChart />;
  if (title.includes("Buffer Cache Miss Rate (%) - Proxy - Trend"))
    return <GaugeChart />;

  // 기본값
  return <LineChart />;
};
