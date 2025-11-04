import LineChart from "@/components/Chart/LineChart";
import GaugeChart from "@/components/Chart/GaugeChart";
import StackChart from "@/components/Chart/StackChart";
import MetricCard from "@/components/Card/MetricCard";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import ErrorRedIcon from "@/assets/general/error-red.svg";
import "./mainChartRenderer.scss";
import { getCssVar } from "@/styles/utils/getCssVar";

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
  if (title.includes("Wait Class 분포 (Sessions)")) {
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
          [10, 15, 20, 18, 22, 25],
          [40, 45, 48, 42, 44, 50],
          [12, 18, 25, 20, 27, 22],
          [5, 10, 8, 9, 11, 12],
          [7, 9, 12, 14, 13, 15],
          [4, 6, 8, 6, 5, 7],
          [9, 14, 16, 13, 15, 18],
          [87, 98, 107, 102, 115, 120],
        ]}
        categories={["00:00", "00:10", "00:20", "00:30", "00:40", "00:50"]}
      />
    );
  }

  // Session 한도 상태 — GaugeChart
  if (title.includes("Session 한도 상태")) return <GaugeChart />;

  // 핵심 테이블스페이스 여유율 — StackChart
  if (title.includes("핵심 테이블스페이스 여유율"))
    return (
      <div className="chart-add-info">
        {/* 추가 정보 */}
        <div className="chart-add-info-container">
          <div className="chart-add-info-container-text">
            <div className="chart-add-info-container-text-success" />
            정상 (0~70%)
          </div>
          <div className="chart-add-info-container-text">
            <div className="chart-add-info-container-text-warning" />
            주의 (70~85%)
          </div>
          <div className="chart-add-info-container-text">
            <div className="chart-add-info-container-text-error" />
            위험 (85%~)
          </div>
        </div>
        {/* 차트 */}
        <StackChart
          colorRules={[
            { min: 0, max: 70, color: getCssVar("sematic-success") },
            { min: 70, max: 85, color: getCssVar("sematic-warning") },
            { min: 85, max: 100, color: getCssVar("red-400") },
          ]}
        />
      </div>
    );

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
  if (title.includes("제한 근접 파라미터 상태 (%)"))
    return (
      <LineChart
        legends={["processes", "sessions", "open_cursors"]}
        seriesData={[
          [70, 152, 180, 257, 122],
          [55, 20, 142, 59, 169],
          [16, 40, 93, 27, 100],
        ]}
        categories={["mm:ss", "mm:ss", "mm:ss", "mm:ss", "mm:ss"]}
      />
    );

  // CPU 상태 — Line Chart
  if (title.includes("CPU 상태 (%)"))
    return (
      <LineChart
        legends={[
          "Host CPU Utilization (%)",
          "DB CPU (On-CPU AAS / cpu_count x 100)",
        ]}
        seriesData={[
          [70, 152, 180, 257, 122],
          [55, 20, 142, 59, 169],
        ]}
        categories={["mm:ss", "mm:ss", "mm:ss", "mm:ss", "mm:ss"]}
      />
    );

  // I/O 지연량 — LineChart
  if (title.includes("I/O 지연량 (ms)"))
    return (
      <LineChart
        legends={[
          "Single-block Read latency(%)",
          "Direct Path Read latency(%)",
          "Direct Path Write latency(%)",
        ]}
        seriesData={[
          [2.1, 2.3, 2.8, 2.5, 3.0, 2.7],
          [0.8, 2.0, 10.2, -3.3, 9.1, 2.4],
          [1.0, 7.0, 3.2, 2.3, 5.1, 7.4],
        ]}
        categories={["10s", "20s", "30s", "40s", "50s", "60s"]}
      />
    );

  // I/O 처리량 — LineChart
  if (title.includes("I/O 처리량 (MB/s)"))
    return (
      <LineChart
        legends={["Physical Read MB/s", "Physical Write MB/s"]}
        seriesData={[
          [100, 120, 110, 130, 150, 160],
          [11, 60, 95, 360, 240, 120],
        ]}
        categories={["10s", "20s", "30s", "40s", "50s", "60s"]}
      />
    );

  // 디폴트 — LineChart
  return <span>차트를 불러올 수 없습니다.</span>;
};
