import api from "../../api/index";
import type { ScenarioMeta, RunRequest, RunStatus } from "./types";
import type { ApiResponse } from "../../api/types";

const BASE = "/api/diagnosis";

export const scenarioApi = {
  list: async (): Promise<ScenarioMeta[]> => {
    const response = await api.get<ApiResponse<ScenarioMeta[]>>(
      `${BASE}/scenarios`,
    );
    return response.data.data ?? [];
  },
  run: async (body: RunRequest): Promise<void> => {
    await api.put<ApiResponse<void>>(`${BASE}/run`, body);
  },
  stop: async (): Promise<void> => {
    await api.post<ApiResponse<void>>(`${BASE}/stop`);
  },
  status: async (): Promise<RunStatus> => {
    const response = await api.get<ApiResponse<RunStatus>>(`${BASE}/status`);
    return response.data.data;
  },
};
