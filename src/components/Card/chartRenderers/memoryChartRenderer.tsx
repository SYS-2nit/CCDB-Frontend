import GaugeChart from "@/components/Chart/GaugeChart";
import LineChart from "@/components/Chart/LineChart";
import TableChart from "@/components/Chart/TableChart";

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

  if (title.includes("Top SQL by Shared Pool Memory"))
    return (
      <TableChart
        columns={[
          "inst_id",
          "sql_id",
          "plan_hash_value",
          "sharable_mem (bytes)",
          "loads",
          "executions",
          "parsing_schema_name",
          "module",
        ]}
        rows={[
          [1, 240, 35, 520, 12_340, 25_600, 0, 0, 0],
          [2, 180, 22, 410, 9_580, 18_320, 0, 0, 0],
          [3, 130, 18, 340, 7_210, 14_850, 0, 0, 0],
        ]}
      />
    );

  // 기본값
  return <LineChart />;
};
