import axios from "axios";

// API 관련
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);

export default api;
<<<<<<< HEAD

// 대시보드 API 타입
export interface DashboardDataRequest {
  instanceId: number;
  timeUnit: "1m" | "10m" | "1h" | "1d";
  category: "CUSTOM" | "CPU" | "MEMORY" | "SESSION" | "IO" | "STORAGE";
}

export interface GraphDataPoint {
  timestamp: string;
  values: Record<string, number | string>;
}

export interface GraphDataResponse {
  id: number;
  name: string;
  description: string | null;
  type: number;
  data: GraphDataPoint[];
}

export interface DashboardDataResponse {
  graphs: GraphDataResponse[];
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// 대시보드 데이터 조회
export const getDashboardData = async (
  params: DashboardDataRequest
): Promise<DashboardDataResponse> => {
  const response = await api.get<ApiResponse<DashboardDataResponse>>(
    "/api/dashboards/data",
    { params }
  );
  return response.data.data;
};

// 위젯 설정 관련 타입
export interface WidgetConfig {
  graphId: number;
  position: number;
}

export interface MemberWidgetSaveRequest {
  widgets: WidgetConfig[];
}

export interface WidgetInfo {
  id: number;
  graphId: number;
  position: number;
}

export interface MemberWidgetResponse {
  widgets: WidgetInfo[];
}

// 위젯 설정 조회
export const getMemberWidgets = async (): Promise<MemberWidgetResponse> => {
  const response = await api.get<ApiResponse<MemberWidgetResponse>>(
    "/api/dashboards/widgets"
  );
  return response.data.data;
};

// 위젯 설정 저장
export const saveMemberWidgets = async (
  request: MemberWidgetSaveRequest
): Promise<void> => {
  await api.post<ApiResponse<string>>("/api/dashboards/widgets", request);
};
=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
