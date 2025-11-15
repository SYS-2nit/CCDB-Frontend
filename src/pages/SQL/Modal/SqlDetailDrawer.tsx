/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import "./SqlDetailDrawer.scss";
import LineChart from "@/components/Chart/LineChart";
import BarChart from "@/components/Chart/BarChart";
import TableChart from "@/components/Chart/TableChart";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";
import StackChart from "@/components/Chart/StackChart";

interface SqlDetailDrawerProps {
  data: SqlDetailData;
  onClose: () => void;
}

const SqlDetailDrawer: React.FC<SqlDetailDrawerProps> = ({ data, onClose }) => {
  // 상세 탭 게이지 비율 계산
  const cpuRaw = data.totalCpu;
  const userIoRaw = data.waitUserIoUsDelta;
  const concRaw = data.waitConcurrencyUsDelta;
  const appRaw = data.waitApplicationUsDelta;
  const clusterRaw = data.waitClusterUsDelta;
  const otherRaw = data.waitOtherUsDelta;

  const formatToMonthDayTime = (raw: string) => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;

    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const MM = String(d.getMinutes()).padStart(2, "0");

    return `${mm}-${dd} ${HH}:${MM}`;
  };

  const gaugeTotal =
    cpuRaw + userIoRaw + concRaw + appRaw + clusterRaw + otherRaw;

  // Table 데이터
  const columns1 = [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
  ];
  const columns2 = [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
  ];

  // Elapsed Time
  const cpuMs = (data.totalCpu / 1_000).toFixed(2);

  // Total Statistics
  const cpuSec = (data.totalCpu / 1_000_000).toFixed(1);
  const elapsedSec = (data.totalElapsed / 1_000_000).toFixed(1);
  const execSec = (data.totalExec / 1_000_000).toFixed(1);
  const avgElapsedSec = (data.avgElapsed / 1_000_000).toFixed(1);
  const waitSec = (data.totalWait / 1_000_000).toFixed(1);

  // Total Wait Classes
  const waitUserIoUsDelta = (data.waitUserIoUsDelta / 1_000).toFixed(2);
  const waitConcurrencyUsDelta = (data.waitConcurrencyUsDelta / 1_000).toFixed(
    2
  );
  const waitApplicationUsDelta = (data.waitApplicationUsDelta / 1_000).toFixed(
    2
  );
  const waitClusterUsDelta = (data.waitClusterUsDelta / 1_000).toFixed(2);
  const waitOtherUsDelta = (data.waitOtherUsDelta / 1_000).toFixed(2);

  const rows1 = [
    ["CPU Time", `${cpuSec} Sec`],
    ["Elapsed Time", `${elapsedSec} Sec`],
    ["Execute Count", `${execSec} Sec`],
    ["Avg Elapsed Time", `${avgElapsedSec} Sec`],
    ["Wait TIme ", `${waitSec} Sec`],
    ["Logical Reads", `${data.totalBuffer} 개`],
    ["Physical Reads", `${data.totalDisk} 개`],
  ];

  const rows2 = [
    ["User I/O", `${waitUserIoUsDelta} ms`],
    ["Concurrency", `${waitConcurrencyUsDelta} ms`],
    ["Application", `${waitApplicationUsDelta} ms`],
    ["Cluster", `${waitClusterUsDelta} ms`],
    ["Other", `${waitOtherUsDelta} ms`],
  ];

  // Trend 공통 카테고리 (x축)
  const elapsedCategories = data.elapsedTrend.map((t) =>
    formatToMonthDayTime(t.label)
  );
  const bufferCategories = data.bufferTrend.map((t) =>
    formatToMonthDayTime(t.label)
  );
  const waitCategories = data.waitTrend.map((t) =>
    formatToMonthDayTime(t.label)
  );

  return (
    <>
      <div className="sql-drawer__overlay" onClick={onClose} />
      <div className="sql-drawer">
        <div className="sql-drawer__header">
          <h3>SQL 상세 탭</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sql-drawer__body">
          {/* ---------------- Query Section ---------------- */}
          <div className="sql-drawer__query-section">
            <h4 className="sql-drawer__query-title">
              Query (id: {data.sqlId})
            </h4>
            <div className="sql-drawer__query-box">{data.sqlText || ""}</div>
          </div>

          {/* ---------------- Trend Section ---------------- */}
          <div className="sql-drawer__trend">
            <h4 className="sql-drawer__trend-title">Trend</h4>

            {/* Elapsed Gauge → StackChart로 변경 */}
            <div className="chart-block">
              <h5>Elapsed Time (ms)</h5>

              <StackChart
                stackCount={6}
                labels={[
                  "CPU",
                  "User I/O",
                  "Concurrency",
                  "Application",
                  "Cluster",
                  "Other",
                ]}
                usage={[
                  cpuRaw,
                  userIoRaw,
                  concRaw,
                  appRaw,
                  clusterRaw,
                  otherRaw,
                ]}
                total={[
                  gaugeTotal,
                  gaugeTotal,
                  gaugeTotal,
                  gaugeTotal,
                  gaugeTotal,
                  gaugeTotal,
                ]}
                height={140}
                tooltipFormatter={(
                  { used: _used, total: _totalpercent, percent },
                  idx
                ) => {
                  const label = [
                    "CPU",
                    "User I/O",
                    "Concurrency",
                    "Application",
                    "Cluster",
                    "Other",
                  ][idx];

                  const secValue = [
                    cpuMs,
                    waitUserIoUsDelta,
                    waitConcurrencyUsDelta,
                    waitApplicationUsDelta,
                    waitClusterUsDelta,
                    waitOtherUsDelta,
                  ][idx];

                  return `${label}: ${secValue} (${percent.toFixed(1)}%)`;
                }}
              />
            </div>

            {/* Elapsed Time Trend */}
            <div className="chart-block">
              <h5>Elapsed Time Trend</h5>
              <LineChart
                legends={["Elapsed Trend", "Execute Trend"]}
                seriesData={[
                  data.elapsedTrend.map((t) => t.value),
                  data.execTrend.map((t) => t.value),
                ]}
                categories={elapsedCategories}
              />
            </div>

            {/* I/O Trend */}
            <div className="chart-block">
              <h5>I/O Trend</h5>
              <LineChart
                legends={["Logical Reads Sum", "Physical Reads Sum"]}
                seriesData={[
                  data.bufferTrend.map((t) => t.value),
                  data.diskTrend.map((t) => t.value),
                ]}
                categories={bufferCategories}
              />
            </div>

            {/* Wait Time Trend */}
            <div className="chart-block">
              <h5>Wait Time Trend</h5>
              <BarChart
                legends={["Wait Time"]}
                seriesData={[data.waitTrend.map((t) => t.value)]}
                categories={waitCategories}
                horizontal={false}
              />
            </div>

            {/* Tables */}
            <div className="chart-block">
              <div className="sql-drawer__tables">
                <div className="sql-drawer__table">
                  <h5>Total Statistics</h5>
                  <TableChart columns={columns1} rows={rows1} size="sm" />
                </div>

                <div className="sql-drawer__table">
                  <h5>Total Wait Classes</h5>
                  <TableChart columns={columns2} rows={rows2} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SqlDetailDrawer;
