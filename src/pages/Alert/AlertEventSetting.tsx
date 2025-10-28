import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState } from "react";
import EventSettingPanel from "./EventSettingPanel/EventSettingPanel";
import "./AlertEventSetting.scss";

type AlertTabType = "1" | "2";

const AlertEventSetting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AlertTabType>("1");
  const tabs = [
    { id: "1", label: "기본" },
    { id: "2", label: "설정 기록" },
  ] as const;

  const [openPanel, setOpenPanel] = useState<string | null>("CPU");
  const panels = ["CPU", "Memory", "Session", "I/O", "Storage"];

  const handleToggle = (title: string) => {
    setOpenPanel((prev) => (prev === title ? null : title));
  };

  return (
    <div className="alert-setting">
      {/* 상단 탭 + 버튼 */}
      <div className="alert-setting__header">
        <TabMenu tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <button className="alert-setting__btn">수신 설정</button>
      </div>

      {/* 콘텐츠 */}
      <div className="alert-setting__container">
        {panels.map((title) => (
          <EventSettingPanel
            key={title}
            title={title}
            isOpen={openPanel === title}
            onToggle={() => handleToggle(title)}
            mode={activeTab === "1" ? "default" : "log"}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertEventSetting;
