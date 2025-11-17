import React, { useState } from "react";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import TableChart from "@/components/Chart/TableChart";

const AlertTable: React.FC = () => {
  const [isListOpen, setIsListOpen] = useState(false);

  // 심각도 DOT 컴포넌트
  const SeverityDot: React.FC<{ color: "yellow" | "red" | "black" }> = ({
    color,
  }) => {
    return <span className={`severity-dot severity-dot--${color}`} />;
  };

  // 심각도 텍스트 매핑
  const severityTextMap: Record<"yellow" | "red" | "black", string> = {
    yellow: "주의",
    red: "위험",
    black: "치명",
  };

  // 더미 데이터
  const data = [
    {
      list: "발생",
      status: "미처리",
      severity: "yellow",
      category: "CPU",
      policy: "정책1",
      event: "이벤트1",
      time: "2025-11-01 12:00",
    },
    {
      list: "종료",
      status: "처리 완료",
      severity: "red",
      category: "Memory",
      policy: "정책2",
      event: "이벤트2",
      time: "2025-11-01 13:20",
    },
    {
      list: "종료",
      status: "미처리",
      severity: "black",
      category: "Session",
      policy: "정책3",
      event: "이벤트3",
      time: "2025-11-01 14:15",
    },
    {
      list: "종료",
      status: "미처리",
      severity: "red",
      category: "I/O",
      policy: "정책4",
      event: "이벤트4",
      time: "2025-11-01 14:40",
    },
    {
      list: "발생",
      status: "처리 완료",
      severity: "black",
      category: "Storage",
      policy: "정책5",
      event: "이벤트5",
      time: "2025-11-01 15:00",
    },
  ];

  // 컬럼 정의
  const columns = [
    { key: "list", label: "처리 내역" },
    { key: "status", label: "상태" },
    { key: "severity", label: "심각도" },
    { key: "category", label: "카테고리" },
    { key: "policy", label: "정책" },
    { key: "event", label: "이벤트" },
    { key: "time", label: "발생시간" },
  ];

  // 행 생성
  const rows = data.map((row) => [
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Button
        size="sm"
        variant="white"
        text="처리내역"
        onClick={(e) => {
          e.stopPropagation();
          setIsListOpen(true);
        }}
      />
    </div>,

    row.status,

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
      <SeverityDot color={row.severity as "yellow" | "red" | "black"} />
      <span>{severityTextMap[row.severity as "yellow" | "red" | "black"]}</span>
    </div>,

    row.category,
    row.policy,
    row.event,
    row.time,
  ]);

  return (
    <div className="alert-table__wrapper">
      <TableChart columns={columns} rows={rows} size="md" />

      {/* 처리내역 모달 */}
      {isListOpen && (
        <Modal
          title="처리내역 추가"
          onClose={() => setIsListOpen(false)}
          onConfirm={() => setIsListOpen(false)}
          confirmText="저장"
          theme="light"
          fields={[
            {
              label: "처리내역",
              helperText:
                "처리 내역을 등록하면 해당 이벤트의 반복 알림 기능은 중지됩니다.",
              type: "textarea",
              placeholder: "255byte 미만까지만 입력 가능합니다.",
              showRegister: true,
              maxBytes: 255,
            },
            {
              label: "처리내역 목록",
              type: "table",
              tableHeaders: ["작성시간", "작성자", "처리내역"],
              tableData: [
                {
                  작성시간: "2025-11-01 10:00",
                  작성자: "admin@ccdb.site",
                  처리내역: "CPU 지연으로 인한 Alert 발생",
                },
                {
                  작성시간: "2025-11-01 11:00",
                  작성자: "user1@gmail.com",
                  처리내역: "모니터링 후 이상 없음",
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
