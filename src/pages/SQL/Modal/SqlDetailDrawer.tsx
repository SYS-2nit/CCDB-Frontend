/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import "./SqlDetailDrawer.scss";
import LineChart from "@/components/Chart/LineChart";
import BarChart from "@/components/Chart/BarChart";
import TableChart from "@/components/Chart/TableChart";
import StackChart from "@/components/Chart/StackChart";
import TabMenu from "@/components/Tabs/TabMenu";
import Pagination from "@/components/Pagination/Pagination";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";
import { getPlanHistoryDetail, getPlanHistoryList } from "@/api/Sql/sql";
import PlanCompareView from "./PlanCompareView";

interface SqlDetailDrawerProps {
  data: SqlDetailData;
  onClose: () => void;
}

/* Tabs */
const tabs = [
  { id: "1", label: "Trend" },
  { id: "2", label: "Plan Change History" },
] as const;

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

const SqlDetailDrawer: React.FC<SqlDetailDrawerProps> = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState("1");

  /* -------------------- Plan Change -------------------- */
  const [planList, setPlanList] = useState<any[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  /* 페이지네이션 */
  const rowsPerPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  /* 상세조회 */
  const [selectedPlanRow, setSelectedPlanRow] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* -------------------- Plan LIST API -------------------- */
  useEffect(() => {
    if (activeTab !== "2") return;

    const loadPlan = async () => {
      setLoadingPlan(true);
      try {
        const list = await getPlanHistoryList(data.sqlId);
        setPlanList(list);
      } finally {
        setLoadingPlan(false);
      }
    };

    loadPlan();
  }, [activeTab, data.sqlId]);

  /* -------------------- Pagination -------------------- */
  const totalPages = Math.max(1, Math.ceil(planList.length / rowsPerPage));

  const pagedData = planList.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* -------------------- Detail API -------------------- */
  const handlePlanRowClick = async (row: any) => {
    if (!row.beforePlanHash || !row.afterPlanHash) return;

    setLoadingDetail(true);
    try {
      const detail = await getPlanHistoryDetail(
        row.sqlId,
        row.beforePlanHash,
        row.afterPlanHash,
        row.time
      );

      setSelectedPlanRow({
        ...row,
        beforePlanText: detail.beforePlanText,
        afterPlanText: detail.afterPlanText,
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  /* -------------------- Trend 계산 -------------------- */
  const cpuRaw = data.totalCpu;
  const userIoRaw = data.waitUserIoUsDelta;
  const concRaw = data.waitConcurrencyUsDelta;
  const appRaw = data.waitApplicationUsDelta;
  const clusterRaw = data.waitClusterUsDelta;
  const otherRaw = data.waitOtherUsDelta;

  const gaugeTotal =
    cpuRaw + userIoRaw + concRaw + appRaw + clusterRaw + otherRaw;

  const rows1 = [
    ["CPU Time", `${(data.totalCpu / 1_000_000).toFixed(1)} Sec`],
    ["Elapsed Time", `${(data.totalElapsed / 1_000_000).toFixed(1)} Sec`],
    ["Execute Count", `${(data.totalExec / 1_000_000).toFixed(1)} Sec`],
    ["Avg Elapsed", `${(data.avgElapsed / 1_000_000).toFixed(1)} Sec`],
    ["Wait Time", `${(data.totalWait / 1_000_000).toFixed(1)} Sec`],
    ["Logical Reads", data.totalBuffer],
    ["Physical Reads", data.totalDisk],
  ];

  const rows2 = [
    ["User I/O", `${data.waitUserIoUsDelta / 1000} ms`],
    ["Concurrency", `${data.waitConcurrencyUsDelta / 1000} ms`],
    ["Application", `${data.waitApplicationUsDelta / 1000} ms`],
    ["Cluster", `${data.waitClusterUsDelta / 1000} ms`],
    ["Other", `${data.waitOtherUsDelta / 1000} ms`],
  ];

  const tableRows = pagedData.map((row) => [
    formatToMonthDayTime(row.time),
    row.queryText,
    row.sqlId,
    row.beforePlanHash,
    row.afterPlanHash,
  ]);

  /* -------------------- Render -------------------- */
  return (
    <>
      <div className="sql-drawer__overlay" onClick={onClose} />

      <div className="sql-drawer">
        <div className="sql-drawer__header">
          <h3>SQL Detail</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sql-drawer__body">
          {/* LEFT QUERY */}
          <div className="sql-drawer__query-section">
            <h4 className="sql-drawer__query-title">
              Query (id: {data.sqlId})
            </h4>
            <div className="sql-drawer__query-box">{data.sqlText}</div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="sql-drawer__content">
            <TabMenu
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {/* TREND TAB */}
            {activeTab === "1" && (
              <div className="sql-drawer__trend">
                <div className="chart-block">
                  <h5>Elapsed Time Stack</h5>
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
                  />
                </div>

                <div className="chart-block">
                  <h5>Elapsed Trend</h5>
                  <LineChart
                    legends={["Elapsed", "Execute"]}
                    seriesData={[
                      data.elapsedTrend.map((t) => t.value),
                      data.execTrend.map((t) => t.value),
                    ]}
                    categories={data.elapsedTrend.map((t) =>
                      formatToMonthDayTime(t.label)
                    )}
                  />
                </div>

                <div className="chart-block">
                  <h5>I/O Trend</h5>
                  <LineChart
                    legends={["Logical Reads", "Physical Reads"]}
                    seriesData={[
                      data.bufferTrend.map((t) => t.value),
                      data.diskTrend.map((t) => t.value),
                    ]}
                    categories={data.bufferTrend.map((t) =>
                      formatToMonthDayTime(t.label)
                    )}
                  />
                </div>

                <div className="chart-block">
                  <h5>Wait Time Trend</h5>
                  <BarChart
                    legends={["Wait"]}
                    seriesData={[data.waitTrend.map((t) => t.value)]}
                    categories={data.waitTrend.map((t) =>
                      formatToMonthDayTime(t.label)
                    )}
                  />
                </div>

                <div className="sql-drawer__tables">
                  <div className="sql-drawer__table">
                    <h5>Total Statistics</h5>
                    <TableChart
                      columns={[
                        { key: "metric", label: "Metric" },
                        { key: "value", label: "Value" },
                      ]}
                      rows={rows1}
                    />
                  </div>

                  <div className="sql-drawer__table">
                    <h5>Total Wait</h5>
                    <TableChart
                      columns={[
                        { key: "metric", label: "Metric" },
                        { key: "value", label: "Value" },
                      ]}
                      rows={rows2}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PLAN CHANGE HISTORY */}
            {activeTab === "2" && (
              <div className="sql-drawer__plan">
                {loadingPlan ? (
                  <div className="loading">Loading Plan History...</div>
                ) : (
                  <>
                    <TableChart
                      columns={[
                        { key: "time", label: "Time" },
                        { key: "query", label: "Query" },
                        { key: "sqlId", label: "SQL ID" },
                        { key: "before", label: "Before" },
                        { key: "after", label: "After" },
                      ]}
                      rows={tableRows}
                      onClick={(_: any, index: number) =>
                        handlePlanRowClick(pagedData[index])
                      }
                    />

                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />

                    {loadingDetail && (
                      <div className="loading">Loading Detail...</div>
                    )}

                    {selectedPlanRow && !loadingDetail && (
                      <PlanCompareView
                        beforeHash={selectedPlanRow.beforePlanHash}
                        afterHash={selectedPlanRow.afterPlanHash}
                        beforePlanText={selectedPlanRow.beforePlanText}
                        afterPlanText={selectedPlanRow.afterPlanText}
                      />
                    )}
                  </>
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
