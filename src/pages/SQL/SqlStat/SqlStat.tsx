/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import "./SqlStat.scss";
import DateInput from "@/components/Input/DateInput";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import BarGauge from "@/components/Chart/BarGauge";
import Pagination from "@/components/Pagination/Pagination";
import Select from "@/components/Select/Select";
import { getSqlDetail, getSqlGraph, getSqlStats } from "@/api/Sql/sql";
import SqlDetailDrawer from "@/pages/SQL/Modal/SqlDetailDrawer";
import LineChart from "@/components/Chart/LineChart";
import Spinner from "@/components/Spinner/Spinner";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";

interface TableData {
  id: number;
  sqlId: string;
  sql: string;
  elapsed: number;
  avg: number;
  wait: number;
  execution: number;
  cpu: number;
  buffer: number;
  disk: number;
}

// X축 변환함수
const formatToMonthDayTime = (raw: string) => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");

  return `${mm}-${dd} ${HH}:${MM}`;
};

const SqlStat: React.FC = () => {
  // 상세 데이터
  const [detailData, setDetailData] = useState<SqlDetailData | null>(null);

  // 날짜
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // 필터
  const [filter, setFilter] = useState("");
  const [interval, setInterval] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

  const [graphData, setGraphData] = useState({
    labels: [] as string[],
    values: [] as number[],
  });

  const [tableData, setTableData] = useState<TableData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableData;
    direction: "asc" | "desc";
  } | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* 통합 조회 API */
  const fetchStats = async (page = 1) => {
    if (!dateRange.start || !dateRange.end) return;

    try {
      setIsLoading(true);
      setNoResult(false);

      /** Graph */
      const graph = await getSqlGraph({
        instanceId: 1,
        startDate: dateRange.start,
        endDate: dateRange.end,
        metric: filter,
        intervalMinutes: interval,
      });

      setGraphData({
        labels: graph.buckets.map((b: any) =>
          formatToMonthDayTime(b.timeLabel)
        ),
        values: graph.buckets.map((b: any) => b.value),
      });

      /** Table */
      const data = await getSqlStats({
        instanceId: 1,
        startDate: dateRange.start,
        endDate: dateRange.end,
        keyword: "",
        minExecCount: 1,
        maxExecCount: 10000,
        orderBy: filter,
        direction: "DESC",
        page: page - 1,
        size: 8,
      });

      // Response 자체가 없거나 content가 없을 경우 처리
      if (!data || !data.content || data.content.length === 0) {
        setNoResult(true);
        setTableData([]);
        setTotalPages(1);
        return;
      }

      const mapped = data.content.map((item) => ({
        id: item.id,
        sqlId: item.sqlId,
        sql: item.sqlText,
        elapsed: item.elapsedUsDelta,
        avg: item.avgElapsed,
        wait: item.waitTimeUsDelta,
        execution: item.executionsDelta,
        buffer: item.bufferGetsDelta,
        disk: item.diskReadsDelta,
        cpu: item.cpuUsDelta,
      }));

      setTableData(mapped);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error("SQL 통계 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /** 페이지 변경 */
  useEffect(() => {
    fetchStats(currentPage);
  }, [currentPage]);

  /** 날짜/필터/interval 변경 시 재조회 */
  useEffect(() => {
    fetchStats(1);
  }, [dateRange, filter, interval]);

  /* 정렬 */
  const handleSort = (key: keyof TableData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc")
      direction = "desc";

    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return tableData;
    return [...tableData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [tableData, sortConfig]);

  const columns = [
    { key: "sql", label: "SQL Text" },
    { key: "elapsed", label: "Elapsed Time" },
    { key: "avg", label: "Avg Elapsed" },
    { key: "wait", label: "Wait Time" },
    { key: "execution", label: "Executions" },
    { key: "buffer", label: "Logical Reads" },
    { key: "disk", label: "Physical Reads" },
    { key: "cpu", label: "CPU Time" },
  ];

  /* Row 구성 */
  const rows = sortedData.map((row) => [
    <span
      className="sql-stat__sql-text sql-stat__sql-clickable"
      onClick={async () => {
        const raw = await getSqlDetail({
          sqlId: row.sqlId,
          startDate: dateRange.start,
          endDate: dateRange.end,
          intervalMinutes: interval,
        });

        /** ★ SqlDetailItem → SqlDetailData 변환 (중요!!) */
        const detail: SqlDetailData = {
          date: `${dateRange.start} ~ ${dateRange.end}`,
          ...raw,
        };

        setDetailData(detail);
        setIsDrawerOpen(true);
      }}
    >
      {row.sql}
    </span>,

    <BarGauge value={row.elapsed} max={50000000} />,
    <BarGauge value={row.avg} max={50000000} />,
    <BarGauge value={row.wait} max={50000000} />,
    <BarGauge value={row.execution} max={50000000} />,
    <BarGauge value={row.buffer} max={50000000} />,
    <BarGauge value={row.disk} max={50000000} />,
    <BarGauge value={row.cpu} max={50000000} />,
  ]);

  if (isLoading) return <Spinner message="데이터 불러오는 중..." />;

  return (
    <div className="sql-stat">
      {/* 검색 영역 */}
      <div className="sql-stat__search">
        <div className="sql-stat__search-left">
          <DateInput
            label="시작일"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, start: e.target.value }))
            }
          />

          <DateInput
            label="종료일"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, end: e.target.value }))
            }
          />

          <Select
            label="필터"
            placeholder="선택하세요."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { label: "Elapsed Time", value: "elapsed" },
              { label: "Avg Elapsed", value: "avg" },
              { label: "Wait Time", value: "wait" },
              { label: "Executions", value: "execution" },
              { label: "Logical Reads", value: "buffer" },
              { label: "Physical Reads", value: "disk" },
              { label: "CPU Time", value: "cpu" },
            ]}
          />

          <div className="sql-stat__search-left-btns">
            <Button
              text="30분"
              size="sm"
              variant={interval === 30 ? "primary" : "white"}
              onClick={() => setInterval(30)}
            />
            <Button
              text="1시간"
              size="sm"
              variant={interval === 60 ? "primary" : "white"}
              onClick={() => setInterval(60)}
            />
            <Button
              text="2시간"
              size="sm"
              variant={interval === 120 ? "primary" : "white"}
              onClick={() => setInterval(120)}
            />
          </div>
        </div>
      </div>

      {/* Summary Chart */}
      <div className="sql-stat__summary">
        <div className="sql-stat__stat__summary-chart">
          Summary Chart
          {graphData.values.length === 0 ? (
            <div className="sql-stat__chart-null">검색 결과가 없습니다.</div>
          ) : (
            <LineChart
              legends={[`${filter} Trend`]}
              seriesData={[graphData.values]}
              categories={graphData.labels}
            />
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="sql-stat__table">
        조회 결과
        {noResult || tableData.length === 0 ? (
          <div className="sql-stat__table-null">검색 결과가 없습니다.</div>
        ) : (
          <TableChart
            columns={columns}
            rows={rows}
            sortable
            sortConfig={sortConfig}
            onSort={(key) => handleSort(key as keyof TableData)}
          />
        )}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => fetchStats(page)}
        />
      </div>

      {/* 상세 Drawer */}
      {isDrawerOpen && detailData && (
        <SqlDetailDrawer
          data={detailData}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default SqlStat;
