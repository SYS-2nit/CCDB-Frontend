import LineChart from "@/components/Chart/LineChart";
import GaugeChart from "@/components/Chart/GaugeChart";
import TableChart from "@/components/Chart/TableChart";

// CPU 탭 전용 차트 렌더러
export const renderCPUChart = (title: string) => {
  if (title.includes("Host CPU Utilization (%) - Current"))
    return <GaugeChart />;

  if (title.includes("Host CPU Utilization (%) - Trend"))
    return (
      <LineChart
        legends={["CPU Utilization"]}
        seriesData={[[40, 45, 48, 42, 44, 50, 55]]}
        categories={["mm:ss", "mm:ss", "mm:ss", "mm:ss", "mm:ss"]}
        yaxisTitle="CPU (%)"
      />
    );
  if (title.includes("DB CPU Saturation (AAS vs Core)"))
    return (
      <LineChart
        legends={["AAS", "Core"]}
        seriesData={[
          [10, 15, 20, 18, 22, 25, 30],
          [40, 45, 48, 42, 44, 50, 55],
        ]}
        categories={["mm:ss", "mm:ss", "mm:ss", "mm:ss", "mm:ss"]}
        yaxisTitle="Load"
      />
    );
  if (title.includes("DB CPU Share of Host (%) - Trend"))
    return (
      <LineChart
        legends={["DB CPU", "Host CPU"]}
        seriesData={[
          [20, 25, 30, 28, 35, 32, 38],
          [60, 65, 68, 64, 66, 70, 72],
        ]}
        categories={["mm:ss", "mm:ss", "mm:ss", "mm:ss", "mm:ss"]}
        yaxisTitle="CPU (%)"
      />
    );
  if (title.includes("CPU Cost per Commit/Execution (ms)"))
    return (
      <LineChart
        legends={["CPU_per_Commit_ms", "CPU_per_Exec_ms"]}
        seriesData={[
          [20, 30, 40, 45, 50],
          [25, 28, 35, 42, 47],
          [10, 15, 20, 18, 22],
        ]}
        categories={["1m", "2m", "3m", "4m", "5m"]}
        yaxisTitle="Usage (%)"
      />
    );
  if (title.includes("Run Queue per Core (Scheduler Load)"))
    return (
      <LineChart
        legends={[
          "RunQ_per_Core",
          "Load_threshold",
          "load_threshold_min",
          "load_threshold_max ",
        ]}
        seriesData={[
          [20, 30, 40, 45, 50],
          [25, 28, 35, 42, 47],
          [10, 15, 20, 18, 22],
        ]}
        categories={["1m", "2m", "3m", "4m", "5m"]}
        yaxisTitle="Usage (%)"
      />
    );

  if (title.includes("Top SQL by CPU (Last 10 min)"))
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
          [3, 130, 18, 340, 7_210, 14_850, 0, 0, 0],
        ]}
      />
    );

  // 기본값
  return <LineChart />;
};
