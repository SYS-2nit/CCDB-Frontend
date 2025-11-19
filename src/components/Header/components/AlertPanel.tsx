// 알림 모달

import { useNavigate } from "react-router-dom";
import {
  acknowledgeEvent,
  isEventRead,
  type EventResponse,
} from "@/api/alerts";

interface AlertPanelProps {
  onClose: () => void;
  alerts: EventResponse[];
  isLoading: boolean;
  onAlertClick: (alert: EventResponse) => Promise<void>;
  formatTimeAgo: (createdAt: string) => string;
}

const AlertPanel = ({
  onClose,
  alerts,
  isLoading,
  onAlertClick,
  formatTimeAgo,
}: AlertPanelProps) => {
  const navigate = useNavigate();

  const formatFullDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  return (
    <div className="alert-panel__overlay" onClick={onClose}>
      <div className="alert-panel" onClick={(e) => e.stopPropagation()}>
        <div className="alert-panel__header">
          <h3>알림 목록</h3>
          <div className="alert-panel__header-actions">
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
              const isResolved = alert.status === "CLOSED";

              return (
                <div
                  key={alert.id}
                  className={`alert-item ${
                    isRead ? "alert-item--read" : "alert-item--unread"
                  }`}
                  onClick={() => onAlertClick(alert)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={`alert-item__icon ${severityClass}`}>
                    {icon}
                  </div>
                  <div className="alert-item__text" style={{ flex: 1 }}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <strong>{alert.message}</strong>
                      {isResolved && (
                        <span
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "bold",
                          }}
                        >
                          해결됨
                        </span>
                      )}
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
