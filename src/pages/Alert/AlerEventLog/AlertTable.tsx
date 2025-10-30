import React, { useState } from "react";
import SeverityDot from "./SeverityDot";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";

const AlertTable: React.FC = () => {
  const [isListOpen, setIsListOpen] = useState(false);

  const data = [
    {
      status: "발생",
      severity: "yellow",
      category: "카테고리1",
      policy: "정책1",
      event: "이벤트1",
      time: "YYYY-MM-DD HH:MM",
    },
    {
      status: "종료",
      severity: "red",
      category: "카테고리2",
      policy: "정책2",
      event: "이벤트2",
      time: "YYYY-MM-DD HH:MM",
    },
    {
      status: "종료",
      severity: "black",
      category: "카테고리3",
      policy: "정책3",
      event: "이벤트3",
      time: "YYYY-MM-DD HH:MM",
    },
  ];

  return (
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
          <tr key={idx}>
            <td>
              <Button
                size="sm"
                variant="white"
                text="처리내역"
                onClick={() => setIsListOpen(true)}
              />
            </td>
            <td>
              <SeverityDot color={row.severity as "yellow" | "red" | "black"} />
            </td>
            <td>{row.category}</td>
            <td>{row.policy}</td>
            <td>{row.event}</td>
            <td>{row.time}</td>
          </tr>
        ))}
      </tbody>

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
              type: "text",
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
                  작성시간: "YYYY-MM-DD HH:MM",
                  작성자: "email1234@gmail.com",
                  처리내역: "어쩌구 저쩌구 ~~~~~ ...",
                },
                { 작성시간: "Data", 작성자: "Data", 처리내역: "Data" },
                { 작성시간: "Data", 작성자: "Data", 처리내역: "Data" },
              ],
            },
          ]}
        />
      )}
    </table>
  );
};

export default AlertTable;
