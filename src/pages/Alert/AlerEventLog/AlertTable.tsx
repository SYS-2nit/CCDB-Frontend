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
      name: "Text",
      message: "FRA Tablespace Full",
      time: "YYYY-MM-DD HH:MM",
    },
    {
      status: "종료",
      severity: "red",
      name: "Text",
      message: "Session 수 임계치 초과",
      time: "YYYY-MM-DD HH:MM",
    },
    {
      status: "종료",
      severity: "black",
      name: "Text",
      message: "FRA Tablespace Full",
      time: "YYYY-MM-DD HH:MM",
    },
  ];

  return (
    <table className="alert-table">
      <thead>
        <tr>
          <th>처리 내역</th>
          <th>심각도</th>
          <th>이벤트 이름</th>
          <th>메시지 요약</th>
          <th>발생 시간</th>
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
            <td>{row.name}</td>
            <td>{row.message}</td>
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
              placeholder: "처리내역을 입력해주세요.",
              type: "text",
            },
            {
              label: "처리내역 상세",
              type: "table",
              tableHeaders: ["작성 시간", "작성자", "처리내역"],
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
