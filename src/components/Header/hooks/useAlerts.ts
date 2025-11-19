import { useState, useEffect, useCallback } from "react";
import {
  fetchUnreadAlertCount,
  fetchPendingAlerts,
  connectSSE,
  acknowledgeEvent,
  isEventRead,
  type EventResponse,
} from "@/api/alerts";

interface UseAlertsOptions {
  memberId: number;
  showPanel: boolean;
}

export const useAlerts = ({ memberId, showPanel }: UseAlertsOptions) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [alerts, setAlerts] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 알림 개수 갱신
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await fetchUnreadAlertCount(memberId);
      setUnreadCount(count);
    } catch (error) {
      console.error("[useAlerts] 알림 개수 조회 실패:", error);
    }
  }, [memberId]);

  // 알림 목록 갱신 (안읽음만)
  const loadAlertsList = useCallback(async () => {
    if (!showPanel) return;

    setIsLoading(true);
    try {
      const result = await fetchPendingAlerts(memberId, 0, 20);
      const unreadAlerts = result.content.filter((alert) => !isEventRead(alert));
      setAlerts(unreadAlerts);
    } catch (error) {
      console.error("[useAlerts] 알림 목록 조회 실패:", error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [showPanel, memberId]);

  // 알림 클릭 시 읽음 처리
  const handleAlertClick = useCallback(
    async (alert: EventResponse) => {
      if (isEventRead(alert)) return;

      try {
        await acknowledgeEvent(alert.id, memberId);
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
        loadUnreadCount();
      } catch (error) {
        console.error("[useAlerts] 알림 읽음 처리 실패:", error);
      }
    },
    [memberId, loadUnreadCount]
  );

  // 알림 개수 조회 (초기 + 10초마다)
  useEffect(() => {
    loadUnreadCount();
    const intervalId = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(intervalId);
  }, [loadUnreadCount]);

  // SSE 실시간 알림 연결
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeoutId: number | undefined;

    const connectToSSE = () => {
      try {
        eventSource = connectSSE(memberId);

        eventSource.addEventListener("connected", () => {
          console.log("[useAlerts] SSE 연결 성공");
        });

        eventSource.addEventListener("alert", (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("[useAlerts] 새 알림 수신:", data);

            loadUnreadCount();

            if (showPanel && data.event) {
              setAlerts((prev) => {
                const exists = prev.some((a) => a.id === data.event.id);
                return exists ? prev : [data.event, ...prev];
              });
            }

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("새 알림", {
                body: data.event?.message || "새로운 알림이 발생했습니다.",
                icon: "/favicon.ico",
                tag: `alert-${data.event?.id}`,
              });
            }
          } catch (error) {
            console.error("[useAlerts] 알림 데이터 파싱 실패:", error);
          }
        });

        eventSource.addEventListener("heartbeat", () => {
          // 연결 유지 확인용
        });

        eventSource.onerror = () => {
          console.error("[useAlerts] SSE 연결 오류");
          if (eventSource?.readyState === EventSource.CLOSED) {
            reconnectTimeoutId = window.setTimeout(() => {
              console.log("[useAlerts] SSE 재연결 시도...");
              connectToSSE();
            }, 3000);
          }
        };
      } catch (error) {
        console.error("[useAlerts] SSE 연결 생성 실패:", error);
      }
    };

    connectToSSE();

    return () => {
      if (reconnectTimeoutId) clearTimeout(reconnectTimeoutId);
      if (eventSource) {
        eventSource.close();
        console.log("[useAlerts] SSE 연결 종료");
      }
    };
  }, [memberId, showPanel, loadUnreadCount]);

  // 패널 열릴 때 알림 목록 조회
  useEffect(() => {
    if (!showPanel) return;
    loadAlertsList();
  }, [showPanel, loadAlertsList]);

  // 알림 상태 변경 이벤트 리스너
  useEffect(() => {
    const handleAlertStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        eventId: number;
        isRead: boolean;
      }>;
      const { eventId, isRead } = customEvent.detail;

      loadUnreadCount();

      if (showPanel) {
        if (isRead) {
          setAlerts((prev) => prev.filter((a) => a.id !== eventId));
        } else {
          loadAlertsList();
        }
      }
    };

    window.addEventListener("alert:read-status-changed", handleAlertStatusChange);
    return () => {
      window.removeEventListener("alert:read-status-changed", handleAlertStatusChange);
    };
  }, [showPanel, loadUnreadCount, loadAlertsList]);

  return {
    unreadCount,
    alerts,
    isLoading,
    handleAlertClick,
  };
};

