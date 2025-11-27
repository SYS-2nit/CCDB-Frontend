// eslint-disable-next-line react-hooks/exhaustive-deps
// 의존성 배열에 fetchGraph, fetchTable을 포함하면 무한 루프 발생 가능
import { useState, useMemo, useEffect, useCallback } from "react";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";
import type { SqlFilterType, IntervalType } from "../../types";
import { convertSqlDetailToDrawerData } from "../../utils/convertSqlDetail";
import { formatToMonthDayTime } from "../../utils/dateFormat";
import { logError } from "../../utils/errorHandler";
/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

import {
  fetchSqlGraph,
  fetchSqlStats,
  fetchSqlDetail,
} from "../services/sqlStatService";
import {
  DEFAULT_PAGE_SIZE,
  MIN_EXEC_COUNT,
  MAX_EXEC_COUNT,
  DEFAULT_INSTANCE_ID,
} from "../../constants";

export interface TableData {
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

export interface GraphData {
  labels: string[];
  values: number[];
  originalTimes: string[];
}

export interface SortConfig {
  key: keyof TableData;
  direction: "asc" | "desc";
}

export const useSqlStat = () => {
  // 상세 데이터
  const [detailData, setDetailData] = useState<SqlDetailData | null>(null);

  // 날짜
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // 필터 (그래프와 테이블 모두 적용)
  const [filter, setFilter] = useState<SqlFilterType | "">("");
  const [interval, setInterval] = useState<IntervalType>(30);

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 그래프 데이터
  const [graphData, setGraphData] = useState<GraphData>({
    labels: [],
    values: [],
    originalTimes: [],
  });

  // 테이블 전체 데이터 (원본)
  const [rawTableData, setRawTableData] = useState<TableData[]>([]);
  // 현재 페이지 데이터
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isGraphLoading, setIsGraphLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* 그래프 데이터 조회 API - useCallback으로 메모이제이션 */
  const fetchGraph = useCallback(async () => {
    if (!dateRange.start || !dateRange.end) return;

    setIsGraphLoading(true);
    try {
      const graph = await fetchSqlGraph({
        instanceId: DEFAULT_INSTANCE_ID,
        startDate: dateRange.start,
        endDate: dateRange.end,
        metric: filter || "elapsed",
        intervalMinutes: interval,
      });

      // 원본 시간 데이터 저장 (tooltip용)
      const originalTimes = graph.buckets.map((b) => b.timeLabel);

      // X축 레이블 생성 (포맷팅) - 모든 데이터에 대해 포맷팅
      const formattedLabels = graph.buckets.map((b) =>
        formatToMonthDayTime(b.timeLabel, dateRange.start, dateRange.end)
      );

      setGraphData({
        labels: formattedLabels,
        values: graph.buckets.map((b) => b.value),
        originalTimes: originalTimes,
      });
    } catch (err) {
      logError("SQL 그래프 데이터 로드", err);
      setGraphData({
        labels: [],
        values: [],
        originalTimes: [],
      });
    } finally {
      setIsGraphLoading(false);
    }
  }, [dateRange.start, dateRange.end, filter, interval]);

  /* 테이블 데이터 조회 API - useCallback으로 메모이제이션 */
  const fetchTable = useCallback(async () => {
    if (!dateRange.start || !dateRange.end) return;

    setNoResult(false);
    setIsTableLoading(true);
    try {
      const data = await fetchSqlStats({
        instanceId: DEFAULT_INSTANCE_ID,
        startDate: dateRange.start,
        endDate: dateRange.end,
        keyword: "",
        minExecCount: MIN_EXEC_COUNT,
        maxExecCount: MAX_EXEC_COUNT,
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
      setTotalPages(Math.ceil(mapped.length / DEFAULT_PAGE_SIZE));
      setCurrentPage(1); // 데이터 로드 시 1페이지로 리셋
    } catch (err) {
      logError("SQL 테이블 데이터 로드", err);
      setNoResult(true);
      setRawTableData([]);
      setTableData([]);
      setTotalPages(1);
    } finally {
      setIsTableLoading(false);
    }
  }, [dateRange.start, dateRange.end, filter]);

  /** currentPage 또는 rawTableData 변경 시 page 데이터 새로 계산 */
  useEffect(() => {
    const start = (currentPage - 1) * DEFAULT_PAGE_SIZE;
    const end = start + DEFAULT_PAGE_SIZE;
    setTableData(rawTableData.slice(start, end));
  }, [currentPage, rawTableData]);

  /** 필터/날짜/interval 변경 시 그래프와 테이블 모두 재조회 */
  useEffect(() => {
    if (dateRange.start && dateRange.end && filter) {
      Promise.all([fetchGraph(), fetchTable()]);
    } else {
      setGraphData({
        labels: [],
        values: [],
        originalTimes: [],
      });
      setRawTableData([]);
      setTableData([]);
      setTotalPages(1);
    }
  }, [filter, dateRange.start, dateRange.end, interval, fetchGraph, fetchTable]);

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

  /* 상세 데이터 조회 */
  const handleRowClick = async (row: TableData) => {
    try {
      const raw = await fetchSqlDetail({
        sqlId: row.sqlId,
        startDate: dateRange.start,
        endDate: dateRange.end,
        intervalMinutes: interval,
      });

      const detail = convertSqlDetailToDrawerData(
        raw,
        `${dateRange.start} ~ ${dateRange.end}`
      );

      setDetailData(detail);
      setIsDrawerOpen(true);
    } catch (err) {
      logError("SQL 상세 데이터 로드", err);
      // 에러 발생 시 drawer는 열지 않음
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return {
    // 상태
    dateRange,
    setDateRange,
    filter,
    setFilter,
    interval,
    setInterval,
    graphData,
    sortedData,
    isGraphLoading,
    isTableLoading,
    noResult,
    sortConfig,
    currentPage,
    totalPages,
    setCurrentPage,
    detailData,
    isDrawerOpen,
    // 함수
    handleSort,
    handleRowClick,
    closeDrawer,
  };
};

