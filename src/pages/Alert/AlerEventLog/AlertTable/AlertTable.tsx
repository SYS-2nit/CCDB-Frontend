import React, { useState } from "react";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import TableChart from "@/components/Chart/TableChart";
import {
  type EventResponse,
  type AlertStatus,
  type AlertLevel,
  fetchEventHistories,
  type ProgressHistoryResponse,
} from "@/api/alerts";

interface AlertTableProps {
  alerts: EventResponse[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const AlertTable: React.FC<AlertTableProps> = ({
  alerts,
  isLoading = false,
  currentPage = 0,
  totalPages = 0,
  onPageChange,
}) => {
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [histories, setHistories] = useState<ProgressHistoryResponse[]>([]);

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
    try {
      const historyData = await fetchEventHistories(eventId);
      setHistories(historyData);
    } catch (error) {
      console.error("[AlertTable] 처리내역 조회 실패:", error);
      setHistories([]);
    }
  };

  // 컬럼 정의
  const columns = [
    { key: "list", label: "처리 내역" },
    { key: "status", label: "상태" },
    { key: "severity", label: "심각도" },
    { key: "message", label: "메시지" },
    { key: "instanceId", label: "인스턴스 ID" },
    { key: "time", label: "발생시간" },
  ];

  // 행 생성
  const rows = alerts.map((alert) => [
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

    statusTextMap[alert.status],

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

    alert.message,
    alert.instanceId ?? "N/A",
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
    <div className="alert-table__wrapper">
      <TableChart columns={columns} rows={rows} size="md" />

      {/* 페이징 (필요시 추가) */}
      {totalPages > 1 && onPageChange && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Button
            text="이전"
            size="sm"
            variant="white"
            onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          />
          <span>
            {currentPage + 1} / {totalPages}
          </span>
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
      {isListOpen && (
        <Modal
          title="처리내역"
          onClose={() => {
            setIsListOpen(false);
            setSelectedEventId(null);
            setHistories([]);
          }}
          onConfirm={() => {
            setIsListOpen(false);
            setSelectedEventId(null);
            setHistories([]);
          }}
          confirmText="닫기"
          theme="light"
          fields={[
            {
              label: "처리내역 목록",
              type: "table",
              tableHeaders: ["작성시간", "작성자", "처리내역"],
              tableData: historyTableData.length > 0 ? historyTableData : [
                {
                  작성시간: "-",
                  작성자: "-",
                  처리내역: "처리내역이 없습니다.",
                },
              ],
            },
          ]}
        />
      )}
    </div>
  );
};

export default AlertTable;
