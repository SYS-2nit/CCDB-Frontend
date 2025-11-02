import React, { useState } from "react";
import "./AlertTable.scss";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Dashboard, { type TabType } from "@/pages/Dashboard/Dashboard";
import { createRoot } from "react-dom/client";
import SeverityDot from "../SeverityDot/SeverityDot";

const AlertTable: React.FC = () => {
  const [isListOpen, setIsListOpen] = useState(false);

  const data = [
    {
      status: "발생",
      severity: "yellow",
      category: "CPU",
      policy: "정책1",
      event: "이벤트1",
      time: "2025-11-01 12:00",
    },
    {
      status: "종료",
      severity: "red",
      category: "Memory",
      policy: "정책2",
      event: "이벤트2",
      time: "2025-11-01 13:20",
    },
    {
      status: "종료",
      severity: "black",
      category: "Session",
      policy: "정책3",
      event: "이벤트3",
      time: "2025-11-01 14:15",
    },
    {
      status: "종료",
      severity: "red",
      category: "I/O",
      policy: "정책4",
      event: "이벤트4",
      time: "2025-11-01 14:40",
    },
    {
      status: "발생",
      severity: "black",
      category: "Storage",
      policy: "정책5",
      event: "이벤트5",
      time: "2025-11-01 15:00",
    },
  ];

  // 카테고리 → 탭 타입 매핑
  const mapCategoryToTab = (category: string): TabType => {
    switch (category.toLowerCase()) {
      case "cpu":
        return "cpu";
      case "memory":
        return "memory";
      case "session":
        return "session";
      case "i/o":
      case "io":
        return "io";
      case "storage":
        return "storage";
      default:
        return "main";
    }
  };

  // 새창으로 대시보드 열기
  const openDashboardWindow = (category: string) => {
    const tabType = mapCategoryToTab(category);
    const newWindow = window.open(
      "",
      "_blank",
      "width=1280,height=900,scrollbars=yes,resizable=yes"
    );

    if (newWindow) {
      newWindow.document.title = `이벤트 스냅샷 - ${category}`;
      const style = document.createElement("style");
      style.textContent = `
        body {
          margin: 0;
          font-family: 'Pretendard;
          background: #fafafa;
        }
      `;
      newWindow.document.head.appendChild(style);

      const container = newWindow.document.createElement("div");
      newWindow.document.body.appendChild(container);

      // Dashboard 렌더링
      const root = createRoot(container);
      root.render(<Dashboard initialTab={tabType} singleTabMode={true} />);
    }
  };

  return (
    <div className="alert-table__wrapper">
      <table className="alert-table">
        <thead>
          <tr>
            <th>처리 내역</th>
            <th>심각도</th>
            <th>카테고리</th>
            <th>정책</th>
            <th>이벤트</th>
            <th>발생시간</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} onClick={() => openDashboardWindow(row.category)}>
              <td>
                <Button
                  size="sm"
                  variant="white"
                  text="처리내역"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsListOpen(true);
                  }}
                />
              </td>
              <td>
                <SeverityDot
                  color={row.severity as "yellow" | "red" | "black"}
                />
              </td>
              <td>{row.category}</td>
              <td>{row.policy}</td>
              <td>{row.event}</td>
              <td>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
              label: "처리내역 상세",
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
