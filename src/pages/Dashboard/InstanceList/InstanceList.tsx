import React from "react";
import "./InstanceList.scss";
import TableChart from "@/components/Chart/TableChart";

const InstanceList: React.FC = () => {
  const columns = [
    "상태",
    "서버명",
    "IP",
    "포트",
    "데이터베이스",
    "CPU 사용률",
    "활성 세션",
    "Lock Wait",
    "Logical Reads",
    "Execute Count",
  ];

  const rows = [
    [
      <div className="status status--normal" key="status" />,
      <span className="link" key="link">
        DBX-localhost-823-1521
      </span>,
      "localhost",
      "1521",
      "CDB$ROOT",
      "5.04",
      "3",
      "0",
      "856",
      "208",
    ],
  ];

  return (
    <div className="instance-list">
      <div className="instance-list__header">
        전체 1
        <div className="instance-list__header-right">
          <div className="danger">
            <div className="status status--danger" key="status" /> 위험 0
          </div>
          <div className="warn">
            <div className="status status--warn" key="status" />
            경고 0
          </div>
          <div className="normal">
            <div className="status status--normal" key="status" />
            정상 1
          </div>
        </div>
      </div>
      <TableChart size="lg" columns={columns} rows={rows} />
    </div>
  );
};

export default InstanceList;
