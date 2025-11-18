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

// ==================== Utility Functions ====================

/**
 * 알림이 읽음 상태인지 확인
 */
export const isEventRead = (event: EventResponse): boolean => {
  return event.acknowledgedAt !== null;
};

/**
 * 알림이 해결 상태인지 확인
 */
export const isEventResolved = (event: EventResponse): boolean => {
  return event.status === "CLOSED";
};

// ==================== API Functions ====================

const ALERTS_ENDPOINT = "/api/alerts";

/**
 * 안읽음 알림 개수 조회 (acknowledgedAt이 null인 알림)
 * 백엔드에서 acknowledgedAt 필터를 지원하지 않을 경우, 클라이언트에서 필터링
 */
export const fetchUnreadAlertCount = async (
  memberId: number,
): Promise<number> => {
  try {
    // 전체 알림 조회 후 클라이언트에서 필터링
    // (백엔드에서 acknowledgedAt 필터를 지원하면 params에 추가 가능)
    const response = await api.get<ApiResponse<Page<EventResponse>>>(
      `${ALERTS_ENDPOINT}/events`,
      {
        params: {
          memberId,
          page: 0,
          size: 1000, // 충분히 큰 값으로 설정 (또는 백엔드에서 카운트만 반환하는 API 사용)
        },
      },
    );
    
    const allAlerts = response.data.data?.content ?? [];
    // acknowledgedAt이 null인 알림만 카운트
    const unreadCount = allAlerts.filter(alert => alert.acknowledgedAt === null).length;
    return unreadCount;
  } catch (error) {
    console.error("[fetchUnreadAlertCount] 안읽음 알림 개수 조회 실패:", error);
    return 0;
  }
};

/**
 * 미처리 알림 목록 조회 (PENDING 상태)
 * 참고: 읽음/안읽음은 acknowledgedAt 필드로 판단
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
 * 알림 메트릭 템플릿 응답 타입
 */
export interface AlertMetricTemplateResponse {
  id: number;
  category: string; // 백엔드에서 String으로 반환 (예: "CPU", "MEMORY")
  graphId: number;
  graphName: string | null;
  metricKey: string;
  metricName: string;
  thresholdFormat: ThresholdFormat;
  defaultWarning: number | null;
  defaultDanger: number | null;
  defaultCritical: number | null;
  description: string | null;
  isActive: boolean;
}

/**
 * 카테고리별 알림 메트릭 템플릿 목록 조회
 */
export const fetchMetricTemplatesByCategory = async (
  category: AlertCategory,
): Promise<AlertMetricTemplateResponse[]> => {
  const response = await api.get<ApiResponse<AlertMetricTemplateResponse[]>>(
    `${ALERTS_ENDPOINT}/templates`,
    {
      params: {
        category,
      },
      // 캐시 방지: 항상 최신 데이터 조회
      headers: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    },
  );
  console.log(`[fetchMetricTemplatesByCategory] 카테고리 ${category} 조회 결과:`, response.data.data);
  return response.data.data ?? [];
};

/**
 * 알림 설정 응답 타입
 */
export interface NotificationSettingsResponse {
  email: string | null;
  slackAddress: string | null;
  warningChannel: string | null;
  dangerChannel: string | null;
  criticalChannel: string | null;
}

/**
 * 알림 설정 업데이트 요청 타입
 */
export interface NotificationSettingsUpdateRequest {
  email?: string | null;
  slackAddress?: string | null;
  warningChannel?: "email" | "slack" | null;
  dangerChannel?: "email" | "slack" | null;
  criticalChannel?: "email" | "slack" | null;
}

/**
 * 알림 테스트 요청 타입
 */
export interface NotificationTestRequest {
  channels?: string[];
}

/**
 * 회원 알림 설정 조회
 */
export const fetchNotificationSettings = async (
  memberId: number,
): Promise<NotificationSettingsResponse> => {
  console.log(`[fetchNotificationSettings] memberId=${memberId} 조회 시작`);
  try {
    const response = await api.get<ApiResponse<NotificationSettingsResponse>>(
      `/api/members/${memberId}/notification-settings`,
    );
    console.log(`[fetchNotificationSettings] 응답:`, response.data);
    return response.data.data!;
  } catch (error: any) {
    console.error(`[fetchNotificationSettings] 에러:`, error);
    console.error(`[fetchNotificationSettings] 응답 데이터:`, error?.response?.data);
    throw error;
  }
};

/**
 * 회원 알림 설정 저장
 */
export const updateNotificationSettings = async (
  memberId: number,
  payload: NotificationSettingsUpdateRequest,
): Promise<NotificationSettingsResponse> => {
  const response = await api.put<ApiResponse<NotificationSettingsResponse>>(
    `/api/members/${memberId}/notification-settings`,
    payload,
  );
  return response.data.data!;
};

/**
 * 알림 테스트 전송
 */
export const testNotification = async (
  memberId: number,
  payload: NotificationTestRequest,
): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(
    `/api/members/${memberId}/notification-settings/test`,
    payload,
  );
  return response.data.data!;
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
 * 알림 이벤트 읽음 → 안읽음 되돌리기
 */
export const unacknowledgeEvent = async (
  id: number,
): Promise<EventResponse> => {
  const response = await api.post<ApiResponse<EventResponse>>(
    `${ALERTS_ENDPOINT}/events/${id}/unacknowledge`,
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

