import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
import MetricCard from "@/components/Card/MetricCard";

// I/O 탭 전용 차트 렌더러
export const renderIOChart = (title: string) => {
  // I/O Performance Dashboard — MetricCard
  if (title.includes("I/O Performance Dashboard")) {
    const metrics = [
      { title: "Cache Hit Ratio(%)", value: "92.7" },
      { title: "Avg I/O Wait Time(ms)", value: "10.4" },
      { title: "Physical Reads(/s)", value: "3,941" },
      { title: "Redo Size(MB/s)", value: "12.7" },
      { title: "Parse/Execute Ratio", value: "1:7" },
      { title: "Direct Path I/O(/s)", value: "730" },
    ];
    return <MetricCard metrics={metrics} columns={3} />;
  }

  // Physical Reads vs Logical Reads — LineChart
  if (title.includes("Physical Reads vs Logical Reads"))
    return (
      <LineChart
        legends={["Physical Reads", "Logical Reads", "Total Reads"]}
        seriesData={[
          [35000, 42000, 39000, 47000, 49000, 46000, 48000],
          [30000, 31000, 29000, 32000, 34000, 33000, 35000],
          [65000, 73000, 68000, 79000, 83000, 79000, 83000],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Reads/sec"
      />
    );

  // Average I/O Wait Time — LineChart
  if (title.includes("Average I/O Wait Time"))
    return (
      <LineChart
        legends={["Average Wait Time (ms)", "95 Percentile (ms)"]}
        seriesData={[
          [8, 10, 12, 11, 9, 10, 8],
          [15, 18, 22, 20, 16, 18, 15],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="ms"
      />
    );

  // 데이터파일별 I/O 통계 (Top 5) — StackChart
  if (title.includes("데이터파일별 I/O 통계"))
    return (
      <StackChart
        legends={[
          "Physical Reads (per min)",
          "Physical Writes (per min)",
          "Avg Read Time (ms)",
        ]}
        seriesData={[
          [500, 420, 380, 460, 520],
          [300, 260, 240, 310, 330],
          [8, 7, 6, 9, 8],
        ]}
        categories={[
          "file01.dbf",
          "file02.dbf",
          "file03.dbf",
          "file04.dbf",
          "file05.dbf",
        ]}
        yaxisTitle="I/O Volume"
      />
    );

  // Direct Path I/O — LineChart
  if (title.includes("Direct Path I/O"))
    return (
      <LineChart
        legends={["Direct Reads", "Direct Writes", "Direct I/O Ratio"]}
        seriesData={[
          [800, 900, 1000, 950, 980, 1020],
          [300, 320, 310, 330, 340, 350],
          [40, 42, 44, 43, 45, 46],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Ops/sec"
      />
    );

  // Redo Generation Rate — AreaChart
  if (title.includes("Redo Generation Rate"))
    return (
      <LineChart
        legends={["Redo Gen (MB/s)", "24h Avg", "Log Switch (1min)"]}
        seriesData={[
          [25, 28, 30, 27, 26, 29, 31],
          [20, 20, 20, 20, 20, 20, 20],
          [1, 1, 2, 2, 1, 1, 1],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="MB/s"
      />
    );

  // DBWR Checkpoint Activity — ComboChart (Line + Bar)
  if (title.includes("DBWR Checkpoint Activity"))
    return (
      <LineChart
        legends={[
          "Write Count (per min)",
          "Write Volume (MB/min)",
          "Checkpoint Not Complete",
        ]}
        seriesData={[
          [800, 900, 950, 1000, 920, 880],
          [50, 55, 60, 65, 63, 58],
          [1, 2, 3, 1, 2, 1],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Activity"
      />
    );

  // SQL Parsing & Execution — LineChart
  if (title.includes("SQL Parsing & Execution"))
    return (
      <LineChart
        legends={["SQL Execute", "Parse Request"]}
        seriesData={[
          [900, 1100, 1050, 1150, 1200, 1250],
          [120, 140, 130, 150, 160, 170],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Ops/sec"
      />
    );

  // 기본값
  return <LineChart />;
};
