import api from "./index";
import type { ApiResponse } from "./types";

// ==================== Enum Types ====================

export type AlertStatus = "PENDING" | "CLOSED";

export type AlertLevel = 1 | 2 | 3; // 1: WARNING, 2: DANGER, 3: CRITICAL

// AlertLevel enum (런타임에서 사용 가능)
export enum AlertLevelEnum {
  WARNING = 1,
  DANGER = 2,
  CRITICAL = 3,
}

export type ThresholdFormat = "PERCENT" | "MS" | "MBPS" | "COUNT";

export type DelayTime = "ONE_MINUTE" | "FIVE_MINUTES" | "TEN_MINUTES" | "ONE_HOUR";

export type AlertCategory = "CPU" | "MEMORY" | "SESSION" | "IO" | "STORAGE";

// ==================== Response Types ====================

export interface EventResponse {
  id: number;
  alertEventId: number | null;
  instanceId: number | null;
  memberId: number | null;
  status: AlertStatus;
  severity: AlertLevel;
  currentValue: number;
  thresholdValue: number;
  thresholdFormat: ThresholdFormat;
  message: string;
  category: AlertCategory | null;
  acknowledgedAt: string | null;
  acknowledgedBy: number | null;
  resolvedAt: string | null;
  resolvedBy: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertPolicyResponse {
  id: number;
  memberId: number | null;
  instanceId: number | null;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AlertEventResponse {
  id: number;
  policyId: number | null;
  category: AlertCategory | null;
  name: string;
  graphId: number | null;
  graphName: string | null;
  metricKey: string;
  metricName: string;
  thresholdFormat: ThresholdFormat;
  warning: number;
  danger: number;
  critical: number;
  formattedWarning: string | null;
  formattedDanger: string | null;
  formattedCritical: string | null;
  delayTime: DelayTime | null;
  days: number | null;
  startTime: string | null;
  endTime: string | null;
  state: boolean;
  isReverse: boolean;
}

export interface ProgressHistoryResponse {
  id: number;
  eventId: number | null;
  content: string | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== Page Type (Spring Data Page) ====================

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 현재 페이지 (0부터 시작)
  size: number; // 페이지 크기
  first: boolean;
  last: boolean;
  numberOfElements: number; // 현재 페이지의 요소 수
}

// ==================== Request Types ====================

export interface AlertPolicyCreateRequest {
  memberId: number;
  instanceId: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
  events?: AlertEventCreateRequest[];
}

export interface AlertPolicyUpdateRequest {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export interface AlertEventCreateRequest {
  policyId: number;
  category: AlertCategory;
  name: string;
  graphId: number;
  metricKey: string;
  metricName: string;
  thresholdFormat: ThresholdFormat;
  warning: number;
  danger: number;
  critical: number;
  delayTime: DelayTime;
  days?: number;
  startTime?: string | null;
  endTime?: string | null;
  state?: boolean;
  isReverse?: boolean;
}

export interface EventAcknowledgeRequest {
  memberId: number;
  message?: string | null;
}

export interface EventResolveRequest {
  memberId: number;
  message?: string | null;
}

export interface ProgressHistoryCreateRequest {
  memberId: number;
  content: string;
}

// ==================== API Functions ====================

const ALERTS_ENDPOINT = "/api/alerts";

/**
 * 미처리 알림 개수 조회
 */
export const fetchUnreadAlertCount = async (
  memberId: number,
): Promise<number> => {
  const response = await api.get<ApiResponse<Page<EventResponse>>>(
    `${ALERTS_ENDPOINT}/events`,
    {
      params: {
        memberId,
        status: "PENDING",
        page: 0,
        size: 1,
      },
    },
  );
  return response.data.data?.totalElements ?? 0;
};

/**
 * 미처리 알림 목록 조회
 */
export const fetchPendingAlerts = async (
  memberId: number,
  page: number = 0,
  size: number = 20,
): Promise<Page<EventResponse>> => {
  const response = await api.get<ApiResponse<Page<EventResponse>>>(
    `${ALERTS_ENDPOINT}/events`,
    {
      params: {
        memberId,
        status: "PENDING",
        page,
        size,
      },
    },
  );
  return response.data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, numberOfElements: 0 };
};

/**
 * 알림 이벤트 목록 조회 (필터링 지원)
 */
export interface FetchAlertsParams {
  memberId?: number;
  instanceId?: number;
  status?: AlertStatus;
  severity?: AlertLevel;
  page?: number;
  size?: number;
}

export const fetchAlerts = async (
  params: FetchAlertsParams = {},
): Promise<Page<EventResponse>> => {
  const { page = 0, size = 20, ...rest } = params;
  const response = await api.get<ApiResponse<Page<EventResponse>>>(
    `${ALERTS_ENDPOINT}/events`,
    {
      params: {
        ...rest,
        page,
        size,
      },
    },
  );
  return response.data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, numberOfElements: 0 };
};

/**
 * 알림 이벤트 상세 조회
 */
export const fetchEventDetail = async (
  id: number,
): Promise<EventResponse> => {
  const response = await api.get<ApiResponse<EventResponse>>(
    `${ALERTS_ENDPOINT}/events/${id}`,
  );
  return response.data.data!;
};

/**
 * 알림 이벤트 처리 이력 조회
 */
export const fetchEventHistories = async (
  eventId: number,
): Promise<ProgressHistoryResponse[]> => {
  const response = await api.get<ApiResponse<ProgressHistoryResponse[]>>(
    `${ALERTS_ENDPOINT}/events/${eventId}/history`,
  );
  return response.data.data ?? [];
};

/**
 * SSE 실시간 알림 연결
 */
export const connectSSE = (userId: number): EventSource => {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "";
  const url = `${baseURL}${ALERTS_ENDPOINT}/sse/stream?userId=${userId}`;
  return new EventSource(url);
};

/**
 * 알림 정책 목록 조회
 */
export const fetchPolicies = async (
  memberId?: number,
  instanceId?: number,
): Promise<AlertPolicyResponse[]> => {
  const params: Record<string, number> = {};
  if (memberId !== undefined) params.memberId = memberId;
  if (instanceId !== undefined) params.instanceId = instanceId;

  const response = await api.get<ApiResponse<AlertPolicyResponse[]>>(
    `${ALERTS_ENDPOINT}/policies`,
    { params },
  );
  return response.data.data ?? [];
};

/**
 * 알림 정책 상세 조회
 */
export const fetchPolicyDetail = async (
  id: number,
): Promise<AlertPolicyResponse> => {
  const response = await api.get<ApiResponse<AlertPolicyResponse>>(
    `${ALERTS_ENDPOINT}/policies/${id}`,
  );
  return response.data.data!;
};

/**
 * 정책별 알림 규칙 목록 조회
 */
export const fetchEventsByPolicy = async (
  policyId: number,
): Promise<AlertEventResponse[]> => {
  const response = await api.get<ApiResponse<AlertEventResponse[]>>(
    `${ALERTS_ENDPOINT}/policies/${policyId}/rules`,
  );
  return response.data.data ?? [];
};

/**
 * 알림 규칙 상세 조회
 */
export const fetchEventRuleDetail = async (
  id: number,
): Promise<AlertEventResponse> => {
  const response = await api.get<ApiResponse<AlertEventResponse>>(
    `${ALERTS_ENDPOINT}/rules/${id}`,
  );
  return response.data.data!;
};

/**
 * 인스턴스별 활성 알림 규칙 목록 조회
 */
export const fetchActiveEventsByInstance = async (
  instanceId: number,
): Promise<AlertEventResponse[]> => {
  const response = await api.get<ApiResponse<AlertEventResponse[]>>(
    `${ALERTS_ENDPOINT}/instances/${instanceId}/rules`,
  );
  return response.data.data ?? [];
};

/**
 * 알림 정책 생성
 */
export const createPolicy = async (
  payload: AlertPolicyCreateRequest,
): Promise<AlertPolicyResponse> => {
  const response = await api.post<ApiResponse<AlertPolicyResponse>>(
    `${ALERTS_ENDPOINT}/policies`,
    payload,
  );
  return response.data.data!;
};

/**
 * 알림 정책 수정
 */
export const updatePolicy = async (
  id: number,
  payload: AlertPolicyUpdateRequest,
): Promise<AlertPolicyResponse> => {
  const response = await api.put<ApiResponse<AlertPolicyResponse>>(
    `${ALERTS_ENDPOINT}/policies/${id}`,
    payload,
  );
  return response.data.data!;
};

/**
 * 알림 정책 삭제
 */
export const deletePolicy = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<null>>(`${ALERTS_ENDPOINT}/policies/${id}`);
};

/**
 * 알림 정책 활성화/비활성화 토글
 */
export const togglePolicy = async (
  id: number,
): Promise<AlertPolicyResponse> => {
  const response = await api.patch<ApiResponse<AlertPolicyResponse>>(
    `${ALERTS_ENDPOINT}/policies/${id}/toggle`,
  );
  return response.data.data!;
};

/**
 * 알림 규칙 생성
 */
export const createEvent = async (
  payload: AlertEventCreateRequest,
): Promise<AlertEventResponse> => {
  const response = await api.post<ApiResponse<AlertEventResponse>>(
    `${ALERTS_ENDPOINT}/events`,
    payload,
  );
  return response.data.data!;
};

/**
 * 알림 규칙 활성화/비활성화 토글
 */
export const toggleEvent = async (
  id: number,
): Promise<AlertEventResponse> => {
  const response = await api.patch<ApiResponse<AlertEventResponse>>(
    `${ALERTS_ENDPOINT}/events/${id}/toggle`,
  );
  return response.data.data!;
};

/**
 * 알림 이벤트 확인 처리
 */
export const acknowledgeEvent = async (
  id: number,
  memberId: number,
  message?: string,
): Promise<EventResponse> => {
  const response = await api.post<ApiResponse<EventResponse>>(
    `${ALERTS_ENDPOINT}/events/${id}/acknowledge`,
    { memberId, message } as EventAcknowledgeRequest,
  );
  return response.data.data!;
};

/**
 * 알림 이벤트 해결 처리
 */
export const resolveEvent = async (
  id: number,
  memberId: number,
  message?: string,
): Promise<EventResponse> => {
  const response = await api.post<ApiResponse<EventResponse>>(
    `${ALERTS_ENDPOINT}/events/${id}/resolve`,
    { memberId, message } as EventResolveRequest,
  );
  return response.data.data!;
};

/**
 * 알림 이벤트 처리 이력 추가
 */
export const addHistory = async (
  eventId: number,
  memberId: number,
  content: string,
): Promise<ProgressHistoryResponse> => {
  const response = await api.post<ApiResponse<ProgressHistoryResponse>>(
    `${ALERTS_ENDPOINT}/events/${eventId}/history`,
    { memberId, content } as ProgressHistoryCreateRequest,
  );
  return response.data.data!;
};

