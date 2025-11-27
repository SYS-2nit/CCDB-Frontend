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
import Spinner from "@/components/Spinner/Spinner";
import type { PlanHistoryRow } from "../types";
import { formatToMonthDayTimeSimple } from "../utils/dateFormat";
import { logError } from "../utils/errorHandler";
import { PLAN_HISTORY_ROWS_PER_PAGE } from "../constants";
import { usePagination } from "../utils/usePagination";
import { formatMicrosecondsToMs } from "../utils/formatValue";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SqlDetailDrawerProps {
  data: SqlDetailData;
  onClose: () => void;
}

/* Tabs */
const tabs = [
  { id: "1", label: "Trend" },
  { id: "2", label: "Plan Change History" },
] as const;

const SqlDetailDrawer: React.FC<SqlDetailDrawerProps> = ({ data, onClose }) => {
  const [activeTab, setActiveTab] = useState("1");

  /* -------------------- Plan Change -------------------- */
  const [planList, setPlanList] = useState<PlanHistoryRow[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  /* 상세조회 */
  const [selectedPlanRow, setSelectedPlanRow] = useState<PlanHistoryRow | null>(
    null
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* -------------------- Plan LIST API -------------------- */
  useEffect(() => {
    if (activeTab !== "2") return;

    const loadPlan = async () => {
      setLoadingPlan(true);
      try {
        const list = await getPlanHistoryList(data.sqlId);
        setPlanList(list);
      } catch (err) {
        logError("Plan History 목록 로드", err);
        setPlanList([]);
      } finally {
        setLoadingPlan(false);
      }
    };

    loadPlan();
  }, [activeTab, data.sqlId]);

  /* -------------------- Pagination -------------------- */
  const { currentPage, totalPages, setCurrentPage, pagedData } = usePagination(
    planList,
    {
      itemsPerPage: PLAN_HISTORY_ROWS_PER_PAGE,
      totalItems: planList.length,
    }
  );

  /* -------------------- Detail API -------------------- */
  const handlePlanRowClick = async (row: PlanHistoryRow) => {
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
        beforePlanText: detail.beforePlanText ?? null,
        afterPlanText: detail.afterPlanText ?? null,
      });
    } catch (err) {
      logError("Plan History 상세 로드", err);
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

  type TableRow = [string, string | number];

  const rows1: TableRow[] = [
    ["CPU Time", formatMicrosecondsToMs(data.totalCpu)],
    ["Elapsed Time", formatMicrosecondsToMs(data.totalElapsed)],
    ["Execute Count", formatMicrosecondsToMs(data.totalExec)],
    ["Avg Elapsed", formatMicrosecondsToMs(data.avgElapsed)],
    ["Wait Time", formatMicrosecondsToMs(data.totalWait)],
    ["Logical Reads", data.totalBuffer],
    ["Physical Reads", data.totalDisk],
  ];

  const rows2: TableRow[] = [
    ["User I/O", formatMicrosecondsToMs(data.waitUserIoUsDelta)],
    ["Concurrency", formatMicrosecondsToMs(data.waitConcurrencyUsDelta)],
    ["Application", formatMicrosecondsToMs(data.waitApplicationUsDelta)],
    ["Cluster", formatMicrosecondsToMs(data.waitClusterUsDelta)],
    ["Other", formatMicrosecondsToMs(data.waitOtherUsDelta)],
  ];

  const tableRows = pagedData.map((row) => [
    formatToMonthDayTimeSimple(row.time),
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
          <h3>SQL 상세 정보</h3>
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
                      formatToMonthDayTimeSimple(t.label)
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
                      formatToMonthDayTimeSimple(t.label)
                    )}
                  />
                </div>

                <div className="chart-block">
                  <h5>Wait Time Trend</h5>
                  <BarChart
                    legends={["Wait"]}
                    seriesData={[data.waitTrend.map((t) => t.value)]}
                    categories={data.waitTrend.map((t) =>
                      formatToMonthDayTimeSimple(t.label)
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
                  <Spinner message="Plan 변경 이력 불러오는 중..." />
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
                      onClick={(_row: React.ReactNode[], index: number) =>
                        handlePlanRowClick(pagedData[index])
                      }
                    />

                    {loadingDetail && <Spinner />}

                    {selectedPlanRow && !loadingDetail && (
                      <PlanCompareView
                        beforeHash={selectedPlanRow.beforePlanHash}
                        afterHash={selectedPlanRow.afterPlanHash}
                        beforePlanText={selectedPlanRow.beforePlanText ?? null}
                        afterPlanText={selectedPlanRow.afterPlanText ?? null}
                      />
                    )}

                    <Pagination
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                    />
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
