/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import "./SqlDetailDrawer.scss";

import LineChart from "@/components/Chart/LineChart";
import BarChart from "@/components/Chart/BarChart";
import TableChart from "@/components/Chart/TableChart";
import StackChart from "@/components/Chart/StackChart";
import TabMenu from "@/components/Tabs/TabMenu";

import type { SqlDetailData } from "@/api/Sql/SqlDetailData";

interface SqlDetailDrawerProps {
  data: SqlDetailData;
  onClose: () => void;
}

/* trend / plan-change 탭 */
const tabs = [
  { id: "1", label: "Trend" },
  { id: "2", label: "Plan Change History" },
] as const;

const SqlDetailDrawer: React.FC<SqlDetailDrawerProps> = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState("1");

  /** ★ Plan Change History 클릭된 row 저장 */
  const [selectedPlanRow, setSelectedPlanRow] = useState<any | null>(null);

  /* 날짜 포맷 */
  const formatToMonthDayTime = (raw: string) => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const MM = String(d.getMinutes()).padStart(2, "0");
    return `${mm}-${dd} ${HH}:${MM}`;
  };

  /* ◆ Trend 탭에서 사용되는 데이터들 */
  const cpuRaw = data.totalCpu;
  const userIoRaw = data.waitUserIoUsDelta;
  const concRaw = data.waitConcurrencyUsDelta;
  const appRaw = data.waitApplicationUsDelta;
  const clusterRaw = data.waitClusterUsDelta;
  const otherRaw = data.waitOtherUsDelta;
  const gaugeTotal =
    cpuRaw + userIoRaw + concRaw + appRaw + clusterRaw + otherRaw;

  const cpuMs = (data.totalCpu / 1000).toFixed(2);
  const cpuSec = (data.totalCpu / 1_000_000).toFixed(1);
  const elapsedSec = (data.totalElapsed / 1_000_000).toFixed(1);
  const execSec = (data.totalExec / 1_000_000).toFixed(1);
  const avgElapsedSec = (data.avgElapsed / 1_000_000).toFixed(1);
  const waitSec = (data.totalWait / 1_000_000).toFixed(1);

  const rows1 = [
    ["CPU Time", `${cpuSec} Sec`],
    ["Elapsed Time", `${elapsedSec} Sec`],
    ["Execute Count", `${execSec} Sec`],
    ["Avg Elapsed Time", `${avgElapsedSec} Sec`],
    ["Wait Time ", `${waitSec} Sec`],
    ["Logical Reads", `${data.totalBuffer}`],
    ["Physical Reads", `${data.totalDisk}`],
  ];

  const rows2 = [
    ["User I/O", `${data.waitUserIoUsDelta / 1000} ms`],
    ["Concurrency", `${data.waitConcurrencyUsDelta / 1000} ms`],
    ["Application", `${data.waitApplicationUsDelta / 1000} ms`],
    ["Cluster", `${data.waitClusterUsDelta / 1000} ms`],
    ["Other", `${data.waitOtherUsDelta / 1000} ms`],
  ];

  const elapsedCategories = data.elapsedTrend.map((t) =>
    formatToMonthDayTime(t.label)
  );
  const bufferCategories = data.bufferTrend.map((t) =>
    formatToMonthDayTime(t.label)
  );
  const waitCategories = data.waitTrend.map((t) =>
    formatToMonthDayTime(t.label)
  );

  /* ◆ Plan Change History용 mock/key 데이터 (API 연동 시 교체) */
  const planList = data.planHistoryList || []; // 예: [{time, query_text, before_plan, after_plan}]

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
          {/* ---------- LEFT: Query Box ---------- */}
          <div className="sql-drawer__query-section">
            <h4 className="sql-drawer__query-title">
              Query (id: {data.sqlId})
            </h4>
            <div className="sql-drawer__query-box">{data.sqlText}</div>
          </div>

          {/* ---------- RIGHT: Tab + Content ---------- */}
          <div className="sql-drawer__content">
            <TabMenu
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* ---------------- TAB: Trend ---------------- */}
            {activeTab === "1" && (
              <div className="sql-drawer__trend">
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
                  />
                </div>

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

                <div className="chart-block">
                  <h5>Wait Time Trend</h5>
                  <BarChart
                    legends={["Wait Time"]}
                    seriesData={[data.waitTrend.map((t) => t.value)]}
                    categories={waitCategories}
                  />
                </div>

                <div className="chart-block">
                  <div className="sql-drawer__tables">
                    <div className="sql-drawer__table">
                      <h5>Total Statistics</h5>
                      <TableChart
                        columns={[
                          { key: "metric", label: "Metric" },
                          { key: "value", label: "Value" },
                        ]}
                        rows={rows1}
                        size="sm"
                      />
                    </div>

                    <div className="sql-drawer__table">
                      <h5>Total Wait Classes</h5>
                      <TableChart
                        columns={[
                          { key: "metric", label: "Metric" },
                          { key: "value", label: "Value" },
                        ]}
                        rows={rows2}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- TAB: Plan Change History ---------------- */}
            {activeTab === "2" && (
              <div className="sql-drawer__plan">
                {/* 상단 테이블 */}
                <TableChart
                  columns={[
                    { key: "time", label: "time" },
                    { key: "query_text", label: "query_text" },
                    { key: "sql_id", label: "sql_id" },
                    { key: "before", label: "before_plan_hash" },
                    { key: "after", label: "after_plan_hash" },
                  ]}
                  rows={planList.map((row: any) => [
                    row.time,
                    row.query_text,
                    row.sql_id,
                    row.before,
                    row.after,
                  ])}
                  onClick={(row: any) => setSelectedPlanRow(row)}
                />

                {/* 아래 diff displayed only when clicked */}
                {selectedPlanRow && (
                  <div className="plan-diff-box">
                    <div className="plan-diff-column">
                      <h5>Before ({selectedPlanRow.before})</h5>
                      <pre>{selectedPlanRow.beforePlanText}</pre>
                    </div>

                    <div className="plan-diff-column">
                      <h5>After ({selectedPlanRow.after})</h5>
                      <pre>{selectedPlanRow.afterPlanText}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SqlDetailDrawer;
