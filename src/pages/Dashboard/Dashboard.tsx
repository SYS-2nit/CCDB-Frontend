import React from "react";
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard">
      <div className="dashboard__grid">
        <ChartCard title="PGA / SGA 압박률" />
        <ChartCard title="Wait Class 분포" />
        <ChartCard title="세션 한도 상태" />
        <ChartCard title="핵심 테이블스페이스 여유율" />
        <ChartCard title="백그라운드 프로세스 상태" />
        <ChartCard title="제한 근접 파라미터 상태" />
        <ChartCard title="CPU 사용" />
        <ChartCard title="I/O 지연량" status="warning" />
        <ChartCard title="I/O 처리량" />
      </div>
    </div>
  );
};

export default Dashboard;
