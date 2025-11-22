// 알림 모달

import { useNavigate } from "react-router-dom";
import {
  acknowledgeEvent,
  isEventRead,
  type EventResponse,
} from "@/api/Alert/alerts";

interface AlertPanelProps {
  onClose: () => void;
  alerts: EventResponse[];
  isLoading: boolean;
  onAlertClick: (alert: EventResponse) => Promise<void>;
  formatTimeAgo: (createdAt: string) => string;
  loadUnreadCount: () => Promise<void>;
}

const AlertPanel = ({
  onClose,
  alerts,
  isLoading,
  onAlertClick,
  formatTimeAgo,
  loadUnreadCount,
}: AlertPanelProps) => {
  const navigate = useNavigate();

  // 알림 클릭 시 히스토리 페이지로 이동
  const handleAlertClickWithHistory = async (alert: EventResponse) => {
    try {
      // 1. 알림 읽음 처리 (실패해도 페이지 이동은 진행)
      try {
        await acknowledgeEvent(alert.id);
        // 알림 읽음 처리 후 즉시 개수 갱신
        await loadUnreadCount();
      } catch (error) {
        console.error("[AlertPanel] 알림 읽음 처리 실패:", error);
        // 읽음 처리 실패해도 페이지 이동은 진행
      }

      // 2. 시간 계산 (알림 발생 시간 기준 전후 5분)
      const alertTime = new Date(alert.createdAt);
      const now = new Date();

      // 시작일: 알림 시간 - 5분
      const startTime = new Date(alertTime);
      startTime.setMinutes(startTime.getMinutes() - 5);

      // 종료일: min(알림 시간 + 5분, 현재 시간)
      const endTime = new Date(alertTime);
      endTime.setMinutes(endTime.getMinutes() + 5);
      const finalEndTime = endTime > now ? now : endTime;

      // datetime-local 형식으로 변환 (YYYY-MM-DDTHH:mm)
      const formatDateTimeLocal = (date: Date): string => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const mi = String(date.getMinutes()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
      };

      // 3. 카테고리 매핑 (AlertCategory → History 카테고리)
      const categoryMap: Record<string, string> = {
        CPU: "CPU",
        MEMORY: "MEMORY",
        SESSION: "SESSION",
        IO: "IO",
        STORAGE: "STORAGE",
      };
      const historyCategory = alert.category
        ? categoryMap[alert.category] || "CPU"
        : "CPU";

      // 4. URL 파라미터 생성
      const params = new URLSearchParams({
        start: formatDateTimeLocal(startTime),
        end: formatDateTimeLocal(finalEndTime),
        category: historyCategory,
        duration: "1분", // 5분 범위이므로 1분 단위로 설정
        instanceId: String(alert.instanceId || ""),
        alertEventId: String(alert.alertEventId || ""), // 알림 이벤트 ID
        severity: String(alert.severity), // 알림 심각도
      });

      // 5. 히스토리 페이지로 이동
      onClose();
      navigate(`/history?${params.toString()}`);
    } catch (error) {
      console.error("[AlertPanel] 히스토리 페이지 이동 실패:", error);
      // 에러 발생 시 기본 알림 클릭 처리
      await onAlertClick(alert);
    }
  };

  return (
    <div className="alert-panel__overlay" onClick={onClose}>
      <div className="alert-panel" onClick={(e) => e.stopPropagation()}>
        <div className="alert-panel__header">
          <h3>알림 목록</h3>
          <div
            className="alert-panel__header-actions"
            style={{ marginLeft: "30px" }}
          >
            <button
              className="alert-panel__event-log-btn"
              onClick={() => {
                onClose();
                navigate("/alert/event-log");
              }}
            >
              이벤트 기록
            </button>
            <button className="alert-panel__close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <div className="alert-panel__content">
          {isLoading ? (
            <div className="alert-panel__empty">로딩 중...</div>
          ) : alerts.length === 0 ? (
            <div className="alert-panel__empty">알림이 없습니다.</div>
          ) : (
            alerts.map((alert) => {
              // 심각도별 아이콘 및 색상 결정
              let icon = "⚠️";
              let severityClass = "alert-item__icon--warning"; // 기본 노란색 (WARNING)

              if (alert.severity === 2) {
                icon = "⚠️";
                severityClass = "alert-item__icon--danger"; // 주황색 (DANGER)
              } else if (alert.severity === 3) {
                icon = "🚨";
                severityClass = "alert-item__icon--critical"; // 빨간색 (CRITICAL)
              }

              // 읽음/안읽음 상태 확인
              const isRead = isEventRead(alert);

              return (
                <div
                  key={alert.id}
                  className={`alert-item ${
                    isRead ? "alert-item--read" : "alert-item--unread"
                  }`}
                  onClick={() => handleAlertClickWithHistory(alert)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`alert-item__icon ${severityClass}`}>
                    {icon}
                  </div>
                  <div className="alert-item__text" style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <strong>{alert.message}</strong>
                    </div>
                    <div className="alert-item__sub">
                      {formatTimeAgo(alert.createdAt)} · 인스턴스 ID:{" "}
                      {alert.instanceId ?? "N/A"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;
