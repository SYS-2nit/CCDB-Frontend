import api from "../index";
import type { ApiResponse } from "../types";

// 보고서 타입
export type ReportType = "DAILY" | "WEEKLY" | "MONTHLY" | "PERFORMANCE";

// 그래프 카테고리
export type GraphCategory =
  | "CUSTOM"
  | "CPU"
  | "MEMORY"
  | "SESSION"
  | "IO"
  | "STORAGE"
  | "PREVENTION"
  | "IMPROVEMENTS";

// 보고서 구성
export type ReportContent = "AI" | "GRAPH" | "TABLE";

// 보고서 생성 요청
export interface ReportGenerateRequest {
  reportType: ReportType;
  instanceId: number;
  startDate: string; // YYYY-MM-DD 형식
  endDate: string | null; // YYYY-MM-DD 형식, 일일 보고서는 null
  categories: GraphCategory[];
  contents: ReportContent[];
}

// 그래프 데이터 포인트
export interface GraphDataPoint {
  timestamp: string;
  values: Record<string, unknown>;
}

// 보고서 데이터 응답
export interface ReportDataResponse {
  graphId: number;
  graphName: string;
  graphInfo: string | null;
  category: GraphCategory;
  dataPoints: GraphDataPoint[];
  summary: Record<string, unknown>; // 통계 요약 (평균, 최대, 최소 등)
}

// AI 요약 응답
export interface ReportSummaryResponse {
  summary: string; // 요약 내용
  issues: string[]; // 발견된 문제점
  recommendations: string[]; // 개선 방안
}

/**
 * 보고서 데이터 조회
 */
export const fetchReportData = async (
  request: ReportGenerateRequest
): Promise<ReportDataResponse[]> => {
  const response = await api.post<ApiResponse<ReportDataResponse[]>>(
    "/api/reports/data",
    request
  );
  return response.data.data ?? [];
};

/**
 * AI 요약 생성
 */
export const generateReportSummary = async (
  request: ReportGenerateRequest
): Promise<ReportSummaryResponse> => {
  const response = await api.post<ApiResponse<ReportSummaryResponse>>(
    "/api/reports/summary",
    request
  );
  return response.data.data ?? { summary: "", issues: [], recommendations: [] };
};

/**
 * 보고서 생성 및 다운로드
 */
export const generateReport = async (
  request: ReportGenerateRequest
): Promise<Blob> => {
  const response = await api.post("/api/reports/generate", request, {
    responseType: "blob",
  });
  return response.data;
};
