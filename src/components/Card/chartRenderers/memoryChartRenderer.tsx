import GaugeChart from "@/components/Chart/GaugeChart";
import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
import { getCssVar } from "@/styles/utils/getCssVar";
import "./ChartRenderer.scss";

// Memory 탭 전용 차트 렌더러
export const memoryChartRenderer = (title: string) => {
  if (title.includes("SGA Efficiency & Memory Pools"))
    return (
      <div className="sga-section">
        {/* 게이지 및 텍스트 영역 */}
        <div className="sga-grid">
          {/* 왼쪽: 게이지 + 세부 메트릭 */}
          <div className="sga-left">
            <GaugeChart
              value={65}
              label="SGA Usage"
              subLabel="Total 1.55 GB / Used 1.01 GB"
              size={140}
            />

            {/* Shared Pool */}
            <div className="sga-metric-block">
              <div className="sga-metric-title">
                <span className="dot green" />
                Shared Pool
                <span className="sga-metric-value">65.00%</span>
              </div>
              <div className="sga-metric-sub">Total 1.55 GB / Used 1.01 GB</div>
            </div>

            {/* Lib.Cache */}
            <div className="sga-metric-block">
              <div className="sga-metric-title">
                <span className="dot green" />
                Lib.Cache
                <span className="sga-metric-value">0.00 Byte</span>
              </div>
            </div>

            {/* Dic.Cache */}
            <div className="sga-metric-block">
              <div className="sga-metric-title">
                <span className="dot green" />
                Dic.Cache
                <span className="sga-metric-value">7.23 MB</span>
              </div>
            </div>
          </div>

          {/* 오른쪽: 메모리 풀 요약 */}
          <div className="sga-right">
            <div className="sga-metric-row">
              <span className="dot green" />
              Large Pool <span className="sga-metric-value">24.19 MB</span>
            </div>
            <div className="sga-metric-row">
              <span className="dot green" />
              Java Pool <span className="sga-metric-value">16.00 MB</span>
            </div>
            <div className="sga-metric-row">
              <span className="dot green" />
              Log Buffer <span className="sga-metric-value">6.80 MB</span>
            </div>
            <div className="sga-metric-row">
              <span className="dot green" />
              Buffer Cache <span className="sga-metric-value">352.00 MB</span>
            </div>
          </div>
        </div>
      </div>
    );

  if (title.includes("PGA Execution Memory & Processes"))
    return (
      <div className="chart-section">
        {/* 게이지 2개 (위) */}
        <div className="chart-grid">
          <div className="chart-item">
            <GaugeChart
              value={45.37}
              label="PGA Memory Usage"
              subLabel="Total 544.00 MB / Used 246.81 MB"
              size={160}
            />
          </div>

          <div className="chart-item">
            <GaugeChart
              value={100}
              label="Memory Sort"
              subLabel="완료된 정렬 메모리 100%"
              size={160}
              color="#22C55E"
            />
          </div>
        </div>
        {/* 텍스트 ) */}
        <div className="chart-metrics">
          <span className="metric-value">Dedicated - 178</span>
          <span className="metric-value">Parallel - 0</span>
          <span className="metric-value">Shared - 1</span>
          <span className="metric-value">Dispatcher - 1</span>
          <span className="metric-value">Job - 3</span>
        </div>
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
  return <LineChart />;
};
