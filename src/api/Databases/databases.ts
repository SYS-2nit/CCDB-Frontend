/*
 ******************************************************************
 작성자: 배지원
 ******************************************************************
 */
import api from "..";
import type { ApiResponse } from "../types";

export interface DatabaseInstanceResponse {
  id: number;
  name: string | null;
  url: string | null;
  username: string | null;
  isActive: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DatabaseCreatePayload {
  name: string;
  ip: string;
  port: number;
  account: string;
  password: string;
  identifier: string;
  connectionType?: "SID" | "SERVICE_NAME";
}

export type DatabaseTestPayload = Omit<DatabaseCreatePayload, "name">;

export interface DatabaseDeletePayload {
  id: number;
  password: string;
}

export interface DatabaseTestResult {
  success?: boolean | null;
  message?: string | null;
  errorMessage?: string | null;
}

export interface DatabaseInstanceListItem {
  id: number;
  status: string | null;
  currentSeverity: number | null; // null=정상, 1=주의, 2=위험, 3=치명
  serverName: string | null;
  ip: string | null;
  port: number | null;
  databaseName: string | null;
  sid: string | null;
  cpuUsage: string | null;
  sessionCount: string | null;
  activeSessionCount: string | null;
  lockWait: string | null;
  pga: string | null;
  sga: string | null;
  createdAt: string | null;
}

const DATABASES_ENDPOINT = "/api/databases";

export const fetchDatabaseInstances = async (): Promise<
  DatabaseInstanceResponse[]
> => {
  const response = await api.get<ApiResponse<DatabaseInstanceResponse[]>>(
    DATABASES_ENDPOINT
  );
  return response.data.data ?? [];
};

export const createDatabaseInstance = async (
  payload: DatabaseCreatePayload
): Promise<DatabaseInstanceResponse | null> => {
  // connectionType이 없으면 기본값 "SID" 설정
  const requestPayload = {
    ...payload,
    connectionType: payload.connectionType || "SID",
  };
  
  console.log("[API] 데이터베이스 생성 요청:", requestPayload);
  
  const response = await api.post<ApiResponse<DatabaseInstanceResponse | null>>(
    DATABASES_ENDPOINT,
    requestPayload,
  );
  return response.data.data ?? null;
};

export const testDatabaseInstance = async (
  payload: DatabaseTestPayload
): Promise<DatabaseTestResult> => {
  const response = await api.post<ApiResponse<DatabaseTestResult | null>>(
    `${DATABASES_ENDPOINT}/test`,
    payload
  );

  return (
    response.data.data ?? {
      success: true,
      message: response.data.message,
      errorMessage: null,
    }
  );
};

export const deleteDatabaseInstance = async (
  payload: DatabaseDeletePayload
): Promise<void> => {
  await api.delete<ApiResponse<null>>(`${DATABASES_ENDPOINT}/${payload.id}`, {
    data: { id: payload.id, password: payload.password },
  });
};

export const fetchInstancesByDatabase = async (
  dbId: number
): Promise<DatabaseInstanceListItem[]> => {
  const response = await api.get<ApiResponse<DatabaseInstanceListItem[]>>(
    `${DATABASES_ENDPOINT}/${dbId}/instances`
  );
  return response.data.data ?? [];
};

export interface InstanceCreatePayload {
  identifier: string;
  connectionType?: "SID" | "SERVICE_NAME";
}

export const createInstanceForDatabase = async (
  dbId: number,
  payload: InstanceCreatePayload
): Promise<DatabaseInstanceListItem> => {
  const response = await api.post<ApiResponse<DatabaseInstanceListItem>>(
    `${DATABASES_ENDPOINT}/${dbId}/instances`,
    payload
  );
  return response.data.data!;
};

export const updateInstanceForDatabase = async (
  dbId: number,
  instanceId: number,
  payload: InstanceCreatePayload
): Promise<DatabaseInstanceListItem> => {
  const response = await api.put<ApiResponse<DatabaseInstanceListItem>>(
    `${DATABASES_ENDPOINT}/${dbId}/instances/${instanceId}`,
    payload
  );
  return response.data.data!;
};

export const deleteInstanceForDatabase = async (
  dbId: number,
  instanceId: number
): Promise<void> => {
  await api.delete<ApiResponse<null>>(
    `${DATABASES_ENDPOINT}/${dbId}/instances/${instanceId}`
  );
};

export const testInstanceForDatabase = async (
  dbId: number,
  payload: InstanceCreatePayload
): Promise<DatabaseTestResult> => {
  const response = await api.post<ApiResponse<DatabaseTestResult | null>>(
    `${DATABASES_ENDPOINT}/${dbId}/instances/test`,
    payload
  );

  return (
    response.data.data ?? {
      success: true,
      message: response.data.message,
      errorMessage: null,
    }
  );
};
