import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState } from "react";
import EventSettingPanel from "./AlertEventSetting/EventSettingPanel/EventSettingPanel";

type AlertTabType = "1" | "2";

const AlertEventSetting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AlertTabType>("1");
  const tabs = [
    { id: "1", label: "기본" },
    { id: "2", label: "설정 기록" },
  ] as const;

  // 한 번에 하나만 open
  const [openPanel, setOpenPanel] = useState<string | null>("CPU");

  const panels = ["CPU", "Memory", "Session", "I/O", "Storage"];

  const handleToggle = (title: string) => {
    setOpenPanel((prev) => (prev === title ? null : title)); // 같은 걸 클릭하면 닫힘
  };

  return (
    <div>
      {/* 탭 메뉴 */}
      <TabMenu tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="alert-setting__container">
        {panels.map((title) => (
          <EventSettingPanel
            key={title}
            title={title}
            isOpen={openPanel === title}
            onToggle={() => handleToggle(title)}
          />
        ))}
      </div>
    </div>
  );
};

export default AlertEventSetting;
