/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "..";

/* ===== SQL 통계 목록 조회 API ===== */
export interface SqlStatsItem {
  id: number;
  instanceId: number;
  sqlId: string;
  sqlText: string;
  elapsedUsDelta: number;
  avgElapsed: number;
  waitTimeUsDelta: number;
  executionsDelta: number;
  bufferGetsDelta: number;
  diskReadsDelta: number;
  cpuUsDelta: number;
}

export interface SqlStatsPage {
  content: SqlStatsItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface ApiWrapper<T> {
  statusCode: number;
  message: string;
  data: T;
}

/* ===== SQL 상세 탭 ===== */
export interface TrendItem {
  label: string;
  value: number;
}

export interface SqlDetailItem {
  id: number;
  instanceId: number;
  sqlId: string;
  sqlText: string;
  totalElapsed: number;
  totalCpu: number;
  totalExec: number;
  totalBuffer: number;
  totalDisk: number;
  totalWait: number;
  avgElapsed: number;

  waitTimeUsDelta: number;
  waitUserIoUsDelta: number;
  waitConcurrencyUsDelta: number;
  waitApplicationUsDelta: number;
  waitClusterUsDelta: number;
  waitOtherUsDelta: number;

  elapsedTrend: TrendItem[];
  cpuTrend: TrendItem[];
  execTrend: TrendItem[];
  bufferTrend: TrendItem[];
  diskTrend: TrendItem[];
  waitTrend: TrendItem[];
  rank: number;
  ratio: number;
}

/* ===== Top SQL 비교 조회 탭 ===== */
export interface SqlCompareResponse {
  baseList: SqlStatsItem[];
  compareList: SqlStatsItem[];
}

/* ===== Daily SQL 그래프 조회 ===== */
export interface SqlDailyGraphItem {
  time: string; // "00:00"
  value: number; // metric value
}

/* -----------------------------------------------------
 * 1. SQL 통계 목록 조회
 * ----------------------------------------------------- */
export const getSqlStats = async (params: {
  instanceId: number;
  startDate: string;
  endDate: string;
  keyword?: string;
  minExecCount?: number;
  maxExecCount?: number;
  orderBy?: string;
  direction?: "ASC" | "DESC";
  page?: number;
  size?: number;
}): Promise<SqlStatsPage> => {
  try {
    const res = await axios.get<ApiWrapper<SqlStatsPage>>("/api/sql/stats", {
      params,
    });

    console.log("[API] SQL 통계 조회 성공:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("[API] SQL 통계 요청 실패:", error);
    throw error;
  }
};

/* -----------------------------------------------------
 * 2. SQL 통계 그래프 조회
 * ----------------------------------------------------- */
export const getSqlGraph = async (params: unknown) => {
  const res = await api.get<ApiWrapper<any>>("/api/sql/graph", { params });
  console.log("[API] SQL 그래프 응답:", res.data);
  return res.data.data;
};

/* -----------------------------------------------------
 * 3. SQL 상세 탭 조회
 * ----------------------------------------------------- */
export const getSqlDetail = async ({
  sqlId,
  startDate,
  endDate,
  intervalMinutes = 30,
}: {
  sqlId: string;
  startDate: string;
  endDate: string;
  intervalMinutes?: number;
}): Promise<SqlDetailItem> => {
  try {
    const res = await axios.get<ApiWrapper<SqlDetailItem>>(
      `/api/sql/detail/${sqlId}`,
      {
        params: { startDate, endDate, intervalMinutes },
      }
    );

    console.log("[API] SQL 상세 조회 성공:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("[API] SQL 상세 조회 실패:", error);
    throw error;
  }
};

/* -----------------------------------------------------
 * 4. Top SQL 비교 조회
 * ----------------------------------------------------- */
export const getSqlCompareStats = async (params: {
  baseDate: string;
  compareDate: string;
  instanceId: number;
  keyword?: string;
  intervalMinutes?: number;
}): Promise<SqlCompareResponse> => {
  try {
    const res = await axios.get<ApiWrapper<SqlCompareResponse>>(
      "/api/sql/compare",
      { params }
    );

    console.log("[API] Top SQL 비교 조회 성공:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("[API] Top SQL 비교 조회 실패:", error);
    throw error;
  }
};

/* -----------------------------------------------------
 * 5. 일뱔 SQL 그래프 조회
 * ----------------------------------------------------- */
export const getDailyGraph = async (params: {
  date: string;
  metric: string;
  instanceId: number;
  intervalMinutes?: number;
}): Promise<SqlDailyGraphItem[]> => {
  try {
    const res = await axios.get<ApiWrapper<SqlDailyGraphItem[]>>(
      "/api/sql/daily",
      { params }
    );

    console.log("[API] Daily SQL 그래프 조회 성공:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("[API] Daily SQL 그래프 조회 실패:", error);
    throw error;
  }
};

/* -----------------------------------------------------
 * 6. 기간별 SQL 그래프 조회 (Period Graph)
 * ----------------------------------------------------- */

export interface SqlPeriodGraphItem {
  datetime: string; // "2025-11-10 16:00"
  value: number;
}

export const getPeriodGraph = async (params: {
  startDate: string;
  endDate: string;
  metric: string;
  intervalMinutes: number;
  instanceId: number;
}): Promise<SqlPeriodGraphItem[]> => {
  try {
    const res = await axios.get<ApiWrapper<SqlPeriodGraphItem[]>>(
      "/api/sql/period",
      { params }
    );

    console.log("[API] 기간별 SQL 그래프 조회 성공:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("[API] 기간별 SQL 그래프 조회 실패:", error);
    throw error;
  }
};
