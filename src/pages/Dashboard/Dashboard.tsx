import React, { useState } from "react";
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";
import ChartSetting from "@/components/Card/ChartSetting";

const Dashboard: React.FC = () => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  const handleSettingToggle = () => {
    setIsSettingOpen((prev) => !prev);
  };

  const chartTitles = [
    "PGA / SGA 압박률",
    "Wait Class 분포",
    "세션 한도 상태",
    "핵심 테이블스페이스 여유율",
    "백그라운드 프로세스 상태",
    "제한 근접 파라미터 상태",
    "CPU 상태",
    "I/O 지연량",
    "I/O 처리량",
  ];

  return (
    <div
      className={`dashboard ${isSettingOpen ? "dashboard--with-setting" : ""}`}
    >
      <div className="dashboard__grid">
        {chartTitles.map((title, i) => (
          <ChartCard
            key={i}
            title={title}
            status={i === 7 ? "warning" : "normal"}
            onSettingClick={handleSettingToggle}
          />
        ))}
      </div>

      {isSettingOpen && <ChartSetting onClose={handleSettingToggle} />}
    </div>
  );
};

export default Dashboard;
