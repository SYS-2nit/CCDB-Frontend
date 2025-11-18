/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../index";
import type { ApiResponse } from "../types";

export interface HistoryGraphDataPoint {
  timestamp: string;
  values: Record<string, unknown>;
}

export interface HistoryGraphDataResponse {
  category: any;
  id: number;
  name: string;
  description: string;
  type: number;
  data: HistoryGraphDataPoint[];
}

export interface HistoryDataResponse {
  graphs: HistoryGraphDataResponse[];
}

export interface HistoryGraphInfo {
  id: number;
  name: string;
  category: string;
}

export interface HistoryGraphListResponse {
  graphs: HistoryGraphInfo[];
}

export interface HistoryDataParams {
  instanceId: number;
  startDateTime?: string; // ISO 8601 형식: "2025-01-01T00:00:00"
  endDateTime?: string; // ISO 8601 형식: "2025-01-02T00:00:00"
  category?: string; // "CUSTOM" | "CPU" | "MEMORY" | "SESSION" | "IO" | "STORAGE"
  graphId?: number;
  keyword?: string;
  timeUnit?: "1m" | "10m" | "1h" | "1d"; // 기본값: "1d"
}

export interface HistoryGraphListParams {
  category: string; // "CUSTOM" | "CPU" | "MEMORY" | "SESSION" | "IO" | "STORAGE"
}

/**
 * 히스토리 데이터 조회
 */
export const fetchHistoryData = async (
  params: HistoryDataParams
): Promise<HistoryDataResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.set("instanceId", String(params.instanceId));

  if (params.startDateTime) {
    searchParams.set("startDateTime", params.startDateTime);
  }
  if (params.endDateTime) {
    searchParams.set("endDateTime", params.endDateTime);
  }
  if (params.category) {
    searchParams.set("category", params.category);
  }
  if (params.graphId) {
    searchParams.set("graphId", String(params.graphId));
  }
  if (params.keyword) {
    searchParams.set("keyword", params.keyword);
  }
  if (params.timeUnit) {
    searchParams.set("timeUnit", params.timeUnit);
  } else {
    searchParams.set("timeUnit", "1d"); // 기본값
  }

  const response = await api.get<ApiResponse<HistoryDataResponse>>(
    `/api/history/data?${searchParams.toString()}`
  );

  return response.data.data ?? { graphs: [] };
};

/**
 * 카테고리별 그래프 목록 조회
 */
export const fetchHistoryGraphList = async (
  params: HistoryGraphListParams
): Promise<HistoryGraphListResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.set("category", params.category);

  const response = await api.get<ApiResponse<HistoryGraphListResponse>>(
    `/api/history/graphs?${searchParams.toString()}`
  );

  return response.data.data ?? { graphs: [] };
};
