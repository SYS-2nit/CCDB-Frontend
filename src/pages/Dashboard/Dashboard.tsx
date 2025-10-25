import React, { useState } from "react";
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";
import ChartSetting from "@/components/Card/ChartSetting";

const Dashboard: React.FC = () => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  const handleSettingToggle = () => {
    setIsSettingOpen((prev) => !prev);
  };

  return (
    <div
      className={`dashboard ${isSettingOpen ? "dashboard--with-setting" : ""}`}
    >
      <div className="dashboard__grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <ChartCard
            key={i}
            title={`Title ${i + 1}`}
            status={i === 7 || i === 8 ? "warning" : "normal"}
            onSettingClick={handleSettingToggle}
          />
        ))}
      </div>

      {isSettingOpen && <ChartSetting onClose={handleSettingToggle} />}
    </div>
  );
};

export default Dashboard;
