import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState } from "react";
import "./AlertEventSetting.scss";
import ReceiveIcon from "@/assets/general/receive.svg";
import Modal from "@/components/Modal/Modal";
import EventSettingPanel from "./AlertEventSetting/EventSettingPanel";

type AlertTabType = "1" | "2";

const AlertEventSetting: React.FC = () => {
  const [isModal, setIsModal] = useState(false);
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
      <div className="alert-setting__header">
        <TabMenu tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <button
          className="alert-setting__receive-btn"
          onClick={() => setIsModal(true)}
        >
          <img src={ReceiveIcon} alt="Receive Icon" />
          수신 설정
        </button>
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

      {/* 모달 */}
      {isModal && (
        <Modal
          title="수신 설정"
          cancelText="테스트"
          confirmText="저장"
          onClose={() => setIsModal(false)}
          onConfirm={() => setIsModal(false)}
          fields={[
            {
              label: "Slack",
              placeholder: "https://hooks.slack.com/services/...",
            },
            { label: "Email", placeholder: "example@company.com" },
            {
              label: "Critical",
              placeholder: "주요 알림 채널을 선택해주세요.",
              type: "select",
              options: ["Slack", "Email"],
            },
            {
              label: "Warning",
              placeholder: "주요 알림 채널을 선택해주세요.",
              type: "select",
              options: ["Slack", "Email"],
            },
          ]}
          theme="light"
        />
      )}
    </div>
  );
};

export default AlertEventSetting;
