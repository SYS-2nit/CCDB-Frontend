import LineChart from "@/components/Chart/LineChart";
import GaugeChart from "@/components/Chart/GaugeChart";
import StackChart from "@/components/Chart/StackChart";
import MetricCard from "@/components/Card/MetricCard";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import ErrorRedIcon from "@/assets/general/error-red.svg";

// Main Custom 탭 전용 차트 렌더러
export const mainChartRenderer = (title: string) => {
  // PGA / SGA 압박률 — MetricCard
  if (title.includes("PGA / SGA 압박률")) {
    const metrics = [
      { title: "Spill Rate %", value: 23 },
      { title: "Spill MB/min", value: 310 },
      { title: "Hard Parses/s", value: 34 },
      { title: "Library Cache Reloads/s", value: 12 },
    ];
    return <MetricCard metrics={metrics} columns={2} />;
  }

  // Wait Class 분포 — LineChart
  if (title.includes("Wait Class 분포")) {
    return (
      <LineChart
        legends={[
          "User I/O",
          "Network",
          "Commit",
          "Cluster",
          "Concurrency",
          "Other",
          "System I/O",
          "AAS Total",
        ]}
        seriesData={[
          [10, 15, 20, 18, 22, 25, 30],
          [40, 45, 48, 42, 44, 50, 55],
        ]}
        categories={["00:00", "00:10", "00:20", "00:30", "00:40", "00:50"]}
        yaxisTitle="Sessions"
      />
    );
  }

  // Session 한도 상태 — GaugeChart
  if (title.includes("Session 한도 상태")) return <GaugeChart />;

  // 핵심 테이블스페이스 여유율 — StackChart
  if (title.includes("핵심 테이블스페이스 여유율")) return <StackChart />;

  // 백그라운드 프로세스 상태 — LineChart
  if (title.includes("백그라운드 프로세스 상태")) {
    const backMetrics = [
      {
        title: "LGWR",
        subtitle: "PID: 1234",
        icon: SuccessGreenIcon,
      },
      { title: "DRWR", subtitle: "PID: 1235", icon: SuccessGreenIcon },
      { title: "PMON", subtitle: "PID: 1236", icon: SuccessGreenIcon },
      { title: "SMON", subtitle: "PID: 1237", icon: ErrorRedIcon },
      { title: "CKPT", subtitle: "PID: 1238", icon: SuccessGreenIcon },
      { title: "ARC0", subtitle: "PID: 1239", icon: ErrorRedIcon },
    ];
    return <MetricCard metrics={backMetrics} columns={3} />;
  }

  // 제한 근접 파라미터 상태 — LineChart
  if (title.includes("제한 근접 파라미터 상태"))
    return (
      <LineChart
        legends={["processes", "sessions", "open_cursors"]}
        seriesData={[
          [70, 152, 180, 257, 122],
          [55, 20, 142, 59, 169],
          [16, 40, 93, 27, 100],
        ]}
        categories={["mm:ss", "mm:ss", "mm:ss", "mm:ss", "mm:ss"]}
        yaxisTitle="%"
      />
    );

  // CPU 상태 — GaugeChart
  if (title.includes("CPU 상태"))
    return (
      <LineChart
        legends={["Host CPU", "DB CPU"]}
        seriesData={[
          [70, 152, 180, 257, 122],
          [55, 20, 142, 59, 169],
        ]}
        categories={["mm:ss", "mm:ss", "mm:ss", "mm:ss", "mm:ss"]}
        yaxisTitle="%"
      />
    );

  // I/O 지연량 — LineChart
  if (title.includes("I/O 지연량"))
    return (
      <LineChart
        legends={["Single-block Read", "Direct Path Read", "Direct Path Write"]}
        seriesData={[
          [2.1, 2.3, 2.8, 2.5, 3.0, 2.7],
          [1.8, 2.0, 2.2, 2.3, 2.1, 2.4],
          [1.0, 7.0, 3.2, 2.3, 5.1, 7.4],
        ]}
        categories={["10s", "20s", "30s", "40s", "50s", "60s"]}
        yaxisTitle="Latency (ms)"
      />
    );

  // I/O 처리량 — LineChart
  if (title.includes("I/O 처리량"))
    return (
      <LineChart
        legends={["Physical Read MB/s", "Physical Write MB/s"]}
        seriesData={[
          [100, 120, 110, 130, 150, 160],
          [11, 60, 95, 360, 240, 120],
        ]}
        categories={["10s", "20s", "30s", "40s", "50s", "60s"]}
        yaxisTitle="MB/s"
      />
    );

  // 디폴트 — LineChart
  return <span>차트를 불러올 수 없습니다.</span>;
};
