import React, { useState } from "react";
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";
import ChartSetting from "@/components/Card/ChartSetting";
import { chartData, type TabType } from "./data/chartData";

const Dashboard: React.FC = () => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("main");

  const handleSettingToggle = () => {
    setIsSettingOpen((prev) => !prev);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "main", label: "Main Custom" },
    { id: "cpu", label: "CPU" },
    { id: "memory", label: "Memory" },
    { id: "session", label: "Session" },
    { id: "io", label: "I/O" },
    { id: "storage", label: "Storage" },
  ];

  const chartTitles = chartData[activeTab];

  return (
    <div
      className={`dashboard ${isSettingOpen ? "dashboard--with-setting" : ""}`}
    >
      {/* 탭 메뉴 */}
      <div className="dashboard__tabs">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            className={`dashboard__tab ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="dashboard__content">
        <div className="dashboard__grid">
          {chartTitles.map((title, i) => (
            <ChartCard
              key={i}
              title={title}
              status={title.includes("지연량") ? "warning" : "normal"}
              onSettingClick={handleSettingToggle}
              showDragIcon={activeTab === "main"}
              showSettingIcon={activeTab === "main"}
            />
          ))}
        </div>

        {isSettingOpen && <ChartSetting onClose={handleSettingToggle} />}
      </div>
    </div>
  );
};

export default Dashboard;
