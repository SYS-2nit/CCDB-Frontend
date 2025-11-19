import api from "../index";
import type { ApiResponse } from "../types";

export interface GraphDataPoint {
  timestamp: string;
  values: Record<string, unknown>;
}

export interface GraphDataResponse {
  id: number;
  name: string;
  description: string;
  type: number;
  data: GraphDataPoint[];
}

export interface DashboardDataResponse {
  graphs: GraphDataResponse[];
}

interface DashboardDataParams {
  instanceId: number;
  timeUnit?: "1m" | "10m" | "1h" | "1d";
  category?: string;
}

export interface MemberWidgetConfig {
  graphId: number;
  position: number;
}

export interface MemberWidgetSaveRequest {
  widgets: MemberWidgetConfig[];
}

export interface GraphDefinition {
  id: number;
  name: string;
  category: string;
  info: string | null;
  type: number | null;
}

export const fetchDashboardData = async (
  params: DashboardDataParams,
  signal?: AbortSignal
): Promise<DashboardDataResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.set("instanceId", String(params.instanceId));
  searchParams.set("timeUnit", params.timeUnit ?? "1m");
  searchParams.set("category", params.category ?? "CUSTOM");

  const response = await api.get<ApiResponse<DashboardDataResponse>>(
    `/api/dashboards/data?${searchParams.toString()}`,
    { signal } // AbortSignal 전달
  );

  return response.data.data ?? { graphs: [] };
};

export const saveMemberWidgets = async (
  payload: MemberWidgetSaveRequest
): Promise<void> => {
  await api.post<ApiResponse<string>>("/api/dashboards/widgets", payload);
};

// 전체 그래프 조회 API
export const fetchAllGraphs = async (): Promise<GraphDefinition[]> => {
  const response = await api.get<ApiResponse<GraphDefinition[]>>("/api/graphs");
  const data = response.data.data ?? [];

  // 줄바꿈 (\n → <br />)
  return data.map((graph) => ({
    ...graph,
    info: graph.info
      ? graph.info
          .replace(/\n<br>\n/g, "<br /><br />") // 기존 섞여있는 패턴 정리
          .replace(/\n/g, "<br />") // 모든 \n을 <br />로 변환
      : null,
  }));
};
