import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState } from "react";

type AlertTabType = "1" | "2";

const AlertEventSetting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AlertTabType>("1");
  const tabs = [
    { id: "1", label: "기본" },
    { id: "2", label: "설정 기록" },
  ] as const;

  return (
    <div>
      {/* 탭 메뉴 */}
      <TabMenu tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default AlertEventSetting;
