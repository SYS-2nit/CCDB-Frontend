/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from "react";
import "./SqlStat.scss";
import DateInput from "@/components/Input/DateInput";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import BarGauge from "@/components/Chart/BarGauge";
import Pagination from "@/components/Pagination/Pagination";
import Select from "@/components/Select/Select";
import { getSqlGraph, getSqlStats } from "@/api/Sql/stats";
import SqlDetailDrawer from "@/pages/SQL/Modal/SqlDetailDrawer";
import LineChart from "@/components/Chart/LineChart";
import Spinner from "@/components/Spinner/Spinner";

interface TableData {
  sql: string;
  elapsed: number;
  avg: number;
  wait: number;
  execution: number;
  cpu: number;
  buffer: number;
  disk: number;
}

const SqlStat: React.FC = () => {
  /* 기본 날짜값: 어제 ~ 오늘 */
  const getDefaultDateRange = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const toString = (d: Date) => d.toISOString().split("T")[0];

    return { start: toString(yesterday), end: toString(today) };
  };

  /* 상태 */
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [filter, setFilter] = useState("elapsed");
  const [interval, setInterval] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [graphData, setGraphData] = useState({
    labels: [] as string[],
    values: [] as number[],
  });

  const [tableData, setTableData] = useState<TableData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const [selectedRow, setSelectedRow] = useState<TableData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [maxValues, setMaxValues] = useState({
    elapsed: 1,
    avg: 1,
    wait: 1,
    execution: 1,
    buffer: 1,
    disk: 1,
    cpu: 1,
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableData;
    direction: "asc" | "desc";
  } | null>(null);

  /* 검색 API 통합 함수 */
  const fetchStats = async (page = 1) => {
    if (!dateRange.start || !dateRange.end) {
      alert("조회 기간을 설정해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setNoResult(false);

      /* 그래프 API 호출 */
      const graph = await getSqlGraph({
        instanceId: 1,
        startDate: dateRange.start,
        endDate: dateRange.end,
        metric: filter, // elapsed, avg, wait, execution, buffer …
        intervalMinutes: interval,
      });

      setGraphData({
        labels: graph.buckets.map((b: { timeLabel: any }) => b.timeLabel),
        values: graph.buckets.map((b: { value: any }) => b.value),
      });

      /* 테이블 API 호출 */
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

      if (data.content.length === 0) {
        setNoResult(true);
        setTableData([]);
        return;
      }

      const mapped = data.content.map((item) => ({
        sql: item.sqlText,
        elapsed: item.elapsedUsDelta,
        avg: item.avgElapsed,
        wait: item.waitTimeUsDelta,
        execution: item.executionsDelta,
        buffer: item.bufferGetsDelta,
        disk: item.diskReadsDelta,
        cpu: item.cpuUsDelta,
      }));

      /* 게이지 max값 계산 */
      const totals = mapped.reduce(
        (acc, cur) => {
          acc.elapsed += cur.elapsed;
          acc.avg += cur.avg;
          acc.wait += cur.wait;
          acc.execution += cur.execution;
          acc.buffer += cur.buffer;
          acc.disk += cur.disk;
          acc.cpu += cur.cpu;
          return acc;
        },
        {
          elapsed: 0,
          avg: 0,
          wait: 0,
          execution: 0,
          buffer: 0,
          disk: 0,
          cpu: 0,
        }
      );

      setMaxValues(totals);
      setTableData(mapped);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error("SQL 통계 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* 페이지 바뀌면 재조회 */
  useEffect(() => {
    fetchStats(currentPage);
  }, [currentPage]);

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

  const rows = sortedData.map((row) => [
    <span
      className="sql-stat__sql-text sql-stat__sql-clickable"
      onClick={() => {
        setSelectedRow(row);
        setIsDrawerOpen(true);
      }}
    >
      {row.sql}
    </span>,
    <BarGauge value={row.elapsed} max={maxValues.elapsed} />,
    <BarGauge value={row.avg} max={maxValues.avg} />,
    <BarGauge value={row.wait} max={maxValues.wait} />,
    <BarGauge value={row.execution} max={maxValues.execution} />,
    <BarGauge value={row.buffer} max={maxValues.buffer} />,
    <BarGauge value={row.disk} max={maxValues.disk} />,
    <BarGauge value={row.cpu} max={maxValues.cpu} />,
  ]);

  /* 로딩 */
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

          {/* 필터 */}
          <Select
            label="필터"
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

          {/* 인터벌 버튼 */}
          <div className="sql-stat__search-left-btns">
            <Button
              text="30분"
              size="sm"
              variant={interval === 30 ? "primary" : "white"}
              onClick={() => {
                setInterval(30);
              }}
            />
            <Button
              text="1시간"
              size="sm"
              variant={interval === 60 ? "primary" : "white"}
              onClick={() => {
                setInterval(60);
              }}
            />
            <Button
              text="2시간"
              size="sm"
              variant={interval === 120 ? "primary" : "white"}
              onClick={() => {
                setInterval(120);
              }}
            />
          </div>
        </div>

        <div className="sql-stat__search-right">
          <Button
            text="검색"
            size="sm"
            variant="primary"
            onClick={() => fetchStats(1)}
          />
        </div>
      </div>

      {/* Summary Chart */}
      <div className="sql-stat__summary">
        <div className="sql-stat__stat__summary-chart">
          Summary Chart
          {graphData.values.length === 0 ? (
            <div className="sql-stat__chart-null">
              그래프 데이터가 없습니다.
            </div>
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
        {noResult ? (
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

      {/* 상세 탭 */}
      {isDrawerOpen && selectedRow && (
        <SqlDetailDrawer
          data={{
            query: selectedRow.sql,
            rank: 1,
            ratio: selectedRow.elapsed,
            exec: selectedRow.execution,
          }}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default SqlStat;
