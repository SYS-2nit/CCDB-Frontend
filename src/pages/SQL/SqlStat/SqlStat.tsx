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

// X축 변환함수 (기간에 따라 자동 조정)
const formatToMonthDayTime = (
  raw: string,
  startDate: string,
  endDate: string
) => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");

  // 기간 계산 (일 단위)
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays >= 7) {
      // 일주일 이상: 일 시간 분 표시 (MM-DD HH:MM)
      return `${mm}-${dd} ${HH}:${MM}`;
    } else if (diffDays >= 2) {
      // 이틀 이상 ~ 일주일 미만: 일 시간 표시 (MM-DD HH:00)
      return `${mm}-${dd} ${HH}:00`;
    }
  }

  // 하루 이하: 분 단위까지 표시
  return `${mm}-${dd} ${HH}:${MM}`;
};

const PAGE_SIZE = 10;

const SqlStat: React.FC = () => {
  // 상세 데이터
  const [detailData, setDetailData] = useState<SqlDetailData | null>(null);

  // 날짜
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // 필터 (그래프와 테이블 모두 적용)
  const [filter, setFilter] = useState("");
  const [interval, setInterval] = useState(30);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 그래프 데이터
  const [graphData, setGraphData] = useState({
    labels: [] as string[],
    values: [] as number[],
    originalTimes: [] as string[], // tooltip용 원본 시간 데이터
  });

  // 테이블 전체 데이터 (원본)
  const [rawTableData, setRawTableData] = useState<TableData[]>([]);
  // 현재 페이지 데이터
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableData;
    direction: "asc" | "desc";
  } | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* 그래프 데이터 조회 API */
  const fetchGraph = async () => {
    if (!dateRange.start || !dateRange.end) return;

    setIsGraphLoading(true);
    try {
      const graph = await getSqlGraph({
        instanceId: 1,
        startDate: dateRange.start,
        endDate: dateRange.end,
        metric: filter,
        intervalMinutes: interval,
      });

      // 원본 시간 데이터 저장 (tooltip용)
      const originalTimes = graph.buckets.map((b: any) => b.timeLabel);

      // X축 레이블 생성 (포맷팅) - 모든 데이터에 대해 포맷팅
      const formattedLabels = graph.buckets.map((b: any) =>
        formatToMonthDayTime(b.timeLabel, dateRange.start, dateRange.end)
      );

      setGraphData({
        labels: formattedLabels, // 모든 레이블 저장 (필터링은 LineChart에서 처리)
        values: graph.buckets.map((b: any) => b.value),
        originalTimes: originalTimes, // tooltip에는 원본 시간 사용
      });
    } catch (err) {
      console.error("그래프 데이터 로드 실패:", err);
    } finally {
      setIsGraphLoading(false);
    }
  };

  /* 테이블 데이터 조회 API */
  const fetchTable = async () => {
    if (!dateRange.start || !dateRange.end) return;

    setNoResult(false);
    setIsTableLoading(true);
    try {
      const data = await getSqlStats({
        instanceId: 1,
        startDate: dateRange.start,
        endDate: dateRange.end,
        keyword: "",
        minExecCount: 1,
        maxExecCount: 10000,
        orderBy: filter || "elapsed",
        direction: "DESC",
      });

      // 빈 데이터 처리
      if (!data || !data.content || data.content.length === 0) {
        setNoResult(true);
        setRawTableData([]);
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

      setRawTableData(mapped);
      setTotalPages(Math.ceil(mapped.length / PAGE_SIZE));
      setCurrentPage(1); // 데이터 로드 시 1페이지로 리셋
    } catch (err) {
      console.error("테이블 데이터 로드 실패:", err);
    } finally {
      setIsTableLoading(false);
    }
  };

  /** currentPage 또는 rawTableData 변경 시 page 데이터 새로 계산 */
  useEffect(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    setTableData(rawTableData.slice(start, end));
  }, [currentPage, rawTableData]);

  /** 필터 변경 시 그래프와 테이블 모두 재조회 */
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchGraph();
      fetchTable();
    }
  }, [filter]);

  /** 날짜/interval 변경 시 그래프와 테이블 모두 재조회 */
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchGraph();
      fetchTable();
    }
  }, [dateRange, interval]);

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

    <BarGauge
      value={row.elapsed}
      max={50000000}
      showPercentage={false}
      isTime={true}
    />,
    <BarGauge
      value={row.avg}
      max={50000000}
      showPercentage={false}
      isTime={true}
    />,
    <BarGauge
      value={row.wait}
      max={50000000}
      showPercentage={false}
      isTime={true}
    />,
    <BarGauge value={row.execution} max={50000000} showPercentage={false} />,
    <BarGauge value={row.buffer} max={50000000} showPercentage={false} />,
    <BarGauge value={row.disk} max={50000000} showPercentage={false} />,
    <BarGauge
      value={row.cpu}
      max={50000000}
      showPercentage={false}
      isTime={true}
    />,
  ]);

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
          {isGraphLoading ? (
            <div className="sql-stat__spinner-wrapper">
              <Spinner message="차트 데이터 불러오는 중..." />
            </div>
          ) : graphData.values.length === 0 ? (
            <div className="sql-stat__chart-null">검색 결과가 없습니다.</div>
          ) : (
            <LineChart
              legends={[`${filter} Trend`]}
              seriesData={[graphData.values]}
              categories={graphData.labels}
              originalTimes={graphData.originalTimes}
              xAxisFilter={(_index, time) => {
                if (!dateRange.start || !dateRange.end) return true;

                const start = new Date(dateRange.start);
                const end = new Date(dateRange.end);
                const diffDays = Math.ceil(
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (diffDays < 2) {
                  // 하루 이하: 모든 레이블 표시
                  return true;
                } else if (diffDays >= 2) {
                  // 이틀 이상: 3시간 단위로 필터링 (0시, 3시, 6시, 9시, 12시, 15시, 18시, 21시)
                  const d = new Date(time);
                  const hour = d.getHours();
                  const minute = d.getMinutes();
                  // 정확히 0, 3, 6, 9, 12, 15, 18, 21시이고 분이 0인 경우만 표시
                  const allowedHours = [0, 3, 6, 9, 12, 15, 18, 21];
                  return allowedHours.includes(hour) && minute === 0;
                }
                return true;
              }}
              height={300}
            />
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="sql-stat__table">
        <div className="sql-stat__table-header">조회 결과</div>
        <div className="sql-stat__table-content">
          {isTableLoading ? (
            <div className="sql-stat__spinner-wrapper">
              <Spinner message="테이블 데이터 불러오는 중..." />
            </div>
          ) : noResult || sortedData.length === 0 ? (
            <div className="sql-stat__table-null">검색 결과가 없습니다.</div>
          ) : (
            <div className="sql-stat__table-wrapper">
              <TableChart
                columns={columns}
                rows={rows}
                sortable
                sortConfig={sortConfig}
                onSort={(key) => handleSort(key as keyof TableData)}
              />
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
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
