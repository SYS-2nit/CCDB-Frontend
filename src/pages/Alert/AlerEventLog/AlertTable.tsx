import React from "react";
import SeverityDot from "./SeverityDot";

const AlertTable: React.FC = () => {
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
              <button className="alert-table-btn">처리내역</button>
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
    </table>
  );
};

export default AlertTable;
