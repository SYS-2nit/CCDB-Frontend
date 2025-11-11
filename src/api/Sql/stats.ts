import axios from "axios";

export interface SqlStatsItem {
  id: number;
  instanceId: number;
  sqlId: string;
  sqlText: string;
  elapsedUsDelta: number;
  waitTimeUsDelta: number;
  executionsDelta: number;
  bufferGetsDelta: number;
  diskReadsDelta: number;
  cpuUsDelta: number;
}

export interface SqlStatsResponse {
  content: SqlStatsItem[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * SQL 통계 목록 조회 (백엔드 실제 데이터)
 */
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
}): Promise<SqlStatsResponse> => {
  try {
    const res = await axios.get<ApiResponse<SqlStatsResponse>>(
      "/api/sql/stats",
      { params }
    );
    console.log("[API] SQL 통계 응답:", res.data);
    return res.data.data;
  } catch (error) {
    console.error("[API] SQL 통계 요청 실패:", error);
    throw error;
  }
};
