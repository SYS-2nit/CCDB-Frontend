import React, { useState } from "react";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import "@/components/Modal/Modal.scss";
import "./AlertTable.scss";
import {
  type EventResponse,
  type AlertStatus,
  type AlertLevel,
  fetchEventHistories,
  addHistory,
  unacknowledgeEvent,
  acknowledgeEvent,
  isEventRead,
  isEventResolved,
  type ProgressHistoryResponse,
} from "@/api/alerts";

interface AlertTableProps {
  alerts: EventResponse[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void; // 알림 목록 새로고침 콜백
}

const AlertTable: React.FC<AlertTableProps> = ({
  alerts,
  isLoading = false,
  currentPage = 0,
  totalPages = 0,
  pageSize = 10,
  onPageChange,
  onRefresh,
}) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [histories, setHistories] = useState<ProgressHistoryResponse[]>([]);
  const [historyContent, setHistoryContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  // memberId 제거 - 백엔드가 기본값 1 사용

  // 심각도 DOT 컴포넌트
  const SeverityDot: React.FC<{ severity: AlertLevel }> = ({ severity }) => {
    const colorMap: Record<AlertLevel, "yellow" | "red" | "black"> = {
      1: "yellow",
      2: "red",
      3: "black",
    };
    return (
      <span className={`severity-dot severity-dot--${colorMap[severity]}`} />
    );
  };

  // 심각도 텍스트 매핑
  const severityTextMap: Record<AlertLevel, string> = {
    1: "주의",
    2: "위험",
    3: "치명",
  };

  // 상태 텍스트 매핑
  const statusTextMap: Record<AlertStatus, string> = {
    PENDING: "미처리",
    CLOSED: "처리 완료",
  };

  // 카테고리 표시 이름 매핑
  const categoryDisplayMap: Record<string, string> = {
    CPU: "CPU",
    MEMORY: "Memory",
    SESSION: "Session",
    IO: "I/O",
    STORAGE: "Storage",
  };

  // 날짜 포맷 함수
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 처리내역 모달 열기
  const handleOpenHistory = async (eventId: number) => {
    setSelectedEventId(eventId);
    setIsListOpen(true);
    setHistoryContent(""); // 입력 내용 초기화
    try {
      const historyData = await fetchEventHistories(eventId);
      setHistories(historyData);
    } catch (error) {
      console.error("[AlertTable] 처리내역 조회 실패:", error);
      setHistories([]);
    }
  };

  // 처리 내역 추가 (백엔드에서 자동으로 status를 CLOSED로 변경)
  const handleAddHistory = async () => {
    if (!historyContent.trim() || !selectedEventId) return;

    setIsSubmitting(true);
    try {
      // 처리 내역 추가 (백엔드에서 자동으로 status를 CLOSED로 변경하고 resolvedAt, resolvedBy 설정)
      await addHistory(selectedEventId, historyContent);

      // 처리내역 목록 새로고침
      const newHistories = await fetchEventHistories(selectedEventId);
      setHistories(newHistories);
      
      // 입력 내용 초기화
      setHistoryContent("");

      // 현재 알림이 안읽음 상태인지 확인
      const currentAlert = alerts.find(a => a.id === selectedEventId);
      if (currentAlert && !isEventRead(currentAlert)) {
        // 안읽음 상태면 읽음 처리
        await acknowledgeEvent(selectedEventId);
        
        // Header에 알림 상태 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent("alert:read-status-changed", {
          detail: {
            eventId: selectedEventId,
            isRead: true, // 읽음으로 변경
          }
        }));
      }

      // 알림 목록 새로고침 (status가 CLOSED로 변경되었으므로)
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("[AlertTable] 처리 내역 추가 실패:", error);
      alert("처리 내역 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 읽음/안읽음 토글 처리
  const handleToggleReadStatus = async (alert: EventResponse, e: React.MouseEvent) => {
    e.stopPropagation(); // 행 클릭 이벤트 방지

    const isRead = isEventRead(alert);
    const newReadStatus = !isRead; // 변경될 상태

    try {
      if (isRead) {
        // 읽음 → 안읽음
        await unacknowledgeEvent(alert.id);
      } else {
        // 안읽음 → 읽음
        await acknowledgeEvent(alert.id);
      }

      // 알림 목록 새로고침
      if (onRefresh) {
        onRefresh();
      }

      // Header에 알림 상태 변경 이벤트 발생
      window.dispatchEvent(new CustomEvent("alert:read-status-changed", {
        detail: {
          eventId: alert.id,
          isRead: newReadStatus, // 변경된 상태
        }
      }));
    } catch (error) {
      console.error("[AlertTable] 읽음 상태 변경 실패:", error);
      alert("읽음 상태 변경에 실패했습니다.");
    }
  };

  // 컬럼 정의
  const columns = [
    { key: "number", label: "번호" },
    { key: "list", label: "처리 내역" },
    { key: "status", label: "상태" },
    { key: "read", label: "읽음" },
    { key: "severity", label: "심각도" },
    { key: "category", label: "카테고리" },
    { key: "message", label: "메시지" },
    { key: "instanceId", label: "인스턴스 ID" },
    { key: "time", label: "발생시간" },
  ];

  // 행 생성
  const rows = alerts.map((alert, index) => [
    // 번호 (중앙 정렬을 위해 div로 감싸기)
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      {currentPage * pageSize + index + 1}
    </div>,

    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        size="sm"
        variant="white"
        text="처리내역"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenHistory(alert.id);
        }}
      />
    </div>,

    // 상태
    statusTextMap[alert.status],

    // 읽음/안읽음 버튼
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <button
        onClick={(e) => handleToggleReadStatus(alert, e)}
        style={{
          padding: "4px 12px",
          fontSize: "12px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          backgroundColor: isEventRead(alert) ? "#e0e0e0" : "#fff",
          color: isEventRead(alert) ? "#666" : "#ff4444",
          fontWeight: isEventRead(alert) ? "normal" : "bold",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isEventRead(alert) ? "#d0d0d0" : "#fff5f5";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isEventRead(alert) ? "#e0e0e0" : "#fff";
        }}
      >
        {isEventRead(alert) ? "읽음" : "안읽음"}
      </button>
    </div>,

    // 심각도
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
        width: "100%",
      }}
    >
      <SeverityDot severity={alert.severity} />
      <span>{severityTextMap[alert.severity]}</span>
    </div>,

    // 카테고리 (백엔드 값: CPU, MEMORY, SESSION, IO, STORAGE)
    alert.category ? categoryDisplayMap[alert.category] || alert.category : "-",

    // 메시지
    alert.message,
    // 인스턴스 ID (중앙 정렬)
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      {alert.instanceId ?? "N/A"}
    </div>,
    formatDateTime(alert.createdAt),
  ]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="alert-table__wrapper">
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          로딩 중...
        </div>
      </div>
    );
  }

  // 빈 상태
  if (alerts.length === 0) {
    return (
      <div className="alert-table__wrapper">
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          알림 데이터가 없습니다.
        </div>
      </div>
    );
  }

  // 처리내역 테이블 데이터 변환
  const historyTableData = histories.map((history) => ({
    작성시간: formatDateTime(history.createdAt),
    작성자: history.createdBy ? `User ${history.createdBy}` : "N/A",
    처리내역: history.content || "",
  }));

  return (
    <div className="alert-table__wrapper alert-event-log-table" style={{ display: "flex", flexDirection: "column", minHeight: "650px" }}>
      <div style={{ flex: 1, minHeight: "550px", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <TableChart columns={columns} rows={rows} size="md" />
        </div>
      </div>

      {/* 페이징 - 항상 하단 고정 위치 */}
      {totalPages >= 1 && onPageChange && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            padding: "20px 0",
            marginTop: "auto",
            width: "100%",
          }}
        >
          <Button
            text="이전"
            size="sm"
            variant="white"
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          />
          
          {/* 페이지 번호 표시 */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              alignItems: "center",
            }}
          >
            {Array.from({ length: totalPages }, (_, i) => i).map((pageNum) => {
              // 현재 페이지 주변 2페이지씩만 표시
              const showPage =
                pageNum === 0 ||
                pageNum === totalPages - 1 ||
                (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);

              if (!showPage) {
                // 생략 표시
                if (
                  pageNum === currentPage - 3 ||
                  pageNum === currentPage + 3
                ) {
                  return (
                    <span key={pageNum} style={{ padding: "0 4px" }}>
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  disabled={pageNum === currentPage}
                  style={{
                    minWidth: "32px",
                    height: "32px",
                    padding: "0 8px",
                    border: `1px solid ${
                      pageNum === currentPage ? "#007bff" : "#ddd"
                    }`,
                    borderRadius: "4px",
                    backgroundColor:
                      pageNum === currentPage ? "#007bff" : "white",
                    color: pageNum === currentPage ? "white" : "#333",
                    cursor: pageNum === currentPage ? "default" : "pointer",
                    fontSize: "14px",
                    fontWeight: pageNum === currentPage ? "bold" : "normal",
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <Button
            text="다음"
            size="sm"
            variant="white"
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          />
        </div>
      )}

      {/* 처리내역 모달 */}
      {isListOpen && selectedEventId && (
        <div className="modal-overlay light" onClick={() => {
          setIsListOpen(false);
          setSelectedEventId(null);
          setHistories([]);
          setHistoryContent("");
        }}>
          <div 
            className="modal light modal--lg" 
            style={{ maxWidth: "900px", width: "90%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="modal__header">
              <h2>처리내역</h2>
              <button 
                className="modal__close" 
                onClick={() => {
                  setIsListOpen(false);
                  setSelectedEventId(null);
                  setHistories([]);
                  setHistoryContent("");
                }}
              >
                ✕
              </button>
            </div>

            {/* 바디 */}
            <div className="modal__body">
              {/* 처리내역 목록 */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                  처리내역 목록
                </label>
                <div style={{ marginTop: "8px" }}>
                  <TableChart
                    columns={[
                      { key: "time", label: "작성시간" },
                      { key: "author", label: "작성자" },
                      { key: "content", label: "처리내역" },
                    ]}
                    rows={historyTableData.length > 0 ? historyTableData.map((item) => [
                      item.작성시간,
                      item.작성자,
                      item.처리내역,
                    ]) : [[
                      "-",
                      "-",
                      "처리내역이 없습니다.",
                    ]]}
                    size="md"
                  />
                </div>
              </div>

              {/* 처리 내역 작성 섹션 */}
              <div style={{ padding: "16px", borderTop: "1px solid #e0e0e0" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                  처리 내역 작성
                </label>
                <textarea
                  value={historyContent}
                  onChange={(e) => setHistoryContent(e.target.value)}
                  placeholder="처리 내역을 입력하세요. 등록 시 알림이 자동으로 해결 처리됩니다."
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    resize: "vertical",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                  disabled={isSubmitting}
                />
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    text={isSubmitting ? "처리 중..." : "등록"}
                    size="sm"
                    variant="primary"
                    onClick={handleAddHistory}
                    disabled={!historyContent.trim() || isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AlertTable;
