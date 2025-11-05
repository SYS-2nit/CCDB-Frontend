import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
import MetricCard from "@/components/Card/MetricCard";
import { getCssVar } from "@/styles/utils/getCssVar";
import MixedChart from "@/components/Chart/MixedChart";

// I/O 탭 전용 차트 렌더러
export const ioChartRenderer = (title: string) => {
  if (title.includes("I/O Performance Dashboard")) {
    const metrics = [
      {
        title: "Cache Hit Ratio(%)",
        value: "92.7",
        subtitle: "90% 이하 시 경고",
      },
      {
        title: "Avg I/O Wait Time(ms)",
        value: "10.4",
        subtitle: "10ms 이상 시 경고",
      },
      {
        title: "Physical Reads(/s)",
        value: "3,941",
        subtitle: "급증 시 경고",
      },
      {
        title: "Redo Size(MB/s)",
        value: "12.7",
        subtitle: "평균 2배 이상 시 경고",
      },
      {
        title: "Parse/Execute Ratio",
        value: "1:7",
        subtitle: "1:5 이하 시 경고",
      },
      {
        title: "Direct Path I/O(/s)",
        value: "730",
        subtitle: "업무시간 급증 경고",
      },
    ];
    return <MetricCard metrics={metrics} columns={6} />;
  }

  if (title.includes("Physical Reads vs Logical Reads"))
    return (
      <LineChart
        legends={[
          "physical_reads_per_sec",
          "logical_reads_per_sec",
          "cache_hit_ratio_pct",
        ]}
        seriesData={[
          [35000, 42000, 39000, 47000, 49000, 46000, 48000],
          [30000, 31000, 29000, 32000, 34000, 33000, 35000],
          [65000, 73000, 68000, 79000, 83000, 79000, 83000],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Reads/sec"
      />
    );

  if (title.includes("Average I/O Wait Time"))
    return (
      <LineChart
        legends={["avg_wait_time_ms", "95_wait_time_ms"]}
        seriesData={[
          [8, 10, 12, 11, 9, 10, 8],
          [15, 18, 22, 20, 16, 18, 15],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="ms"
      />
    );

  if (title.includes("데이터파일별 I/O 통계 (Top 5)"))
    return (
      <StackChart
        legends={[
          "file_name",
          "tablespace_name",
          "physical_reads_per_min",
          "physical_writes_per_min",
          "avg_read_time_ms",
          "io_share_pct",
        ]}
        seriesData={[
          [500, 420, 380, 460, 520],
          [300, 260, 240, 310, 330],
          [8, 7, 6, 9, 8],
        ]}
        categories={[
          "file_name",
          "tablespace_name",
          "physical_reads_per_min",
          "physical_writes_per_min",
          "avg_read_time_ms",
          "io_share_pct",
        ]}
        colorRules={[
          { min: 0, max: 70, color: getCssVar("sematic-success") },
          { min: 70, max: 85, color: getCssVar("sematic-warning") },
          { min: 85, max: 100, color: getCssVar("red-400") },
        ]}
      />
    );

  if (title.includes("Direct Path I/O"))
    return (
      <LineChart
        legends={[
          "physical_reads_direct_per_sec",
          "physical_writes_direct_per_sec",
          "direct_io_ratio_pct",
        ]}
        seriesData={[
          [800, 900, 1300, 950, 980, 1020],
          [300, 320, 2350, 2230, 720, 350],
          [1000, 1000, 1000, 1000, 1000, 1000],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
      />
    );

  if (title.includes("Redo Generation Rate"))
    return (
      <LineChart
        legends={[
          "redo_generation_mbps",
          "redo_generation_mbps_total",
          "redo_generation_24h_avg",
          "log_switch_count_1min",
          "log_switch_count_5min",
        ]}
        seriesData={[
          [25, 28, 30, 27, 26, 29, 31],
          [20, 20, 20, 20, 20, 20, 20],
          [1, 1, 2, 2, 1, 1, 1],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
      />
    );

  if (title.includes("DBWR Checkpoint Activity"))
    return (
      <MixedChart
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        columnData={[400, 430, 390, 200, 480, 290]}
        lineData={[23, 42, 35, 43, 22, 31]}
        yaxisLeftTitle="dbwr_write_count_per_min"
        yaxisRightTitle="dbwr_write_volume_mb_per_min"
      />
    );

  if (title.includes("SQL Parsing & Execution"))
    return (
      <LineChart
        legends={["sql_execute_per_sec", "parser_request_per_sec"]}
        seriesData={[
          [900, 1100, 1050, 1150, 1200, 1250],
          [120, 140, 130, 150, 160, 170],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
      />
    );

  // 기본값
  return <LineChart />;
};
