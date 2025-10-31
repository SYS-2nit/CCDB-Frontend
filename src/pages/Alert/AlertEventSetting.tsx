import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState } from "react";
import "./AlertEventSetting.scss";
import ReceiveIcon from "@/assets/general/receive.svg";
import Modal from "@/components/Modal/Modal";
import EventSettingPanel, {
  type EventCard,
} from "./AlertEventSetting/EventSettingPanel";

type AlertTabType = "1" | "2";

interface Policy {
  id: number;
  name: string;
  events: EventCard[];
}

const AlertEventSetting: React.FC = () => {
  const [isModal, setIsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AlertTabType>("1");
  const [openPanel, setOpenPanel] = useState<boolean>(true);
  const [policies, setPolicies] = useState<Policy[]>([]);

  const tabs = [
    { id: "1", label: "기본" },
    { id: "2", label: "설정 기록" },
  ] as const;

  const handleToggle = () => setOpenPanel((prev) => !prev);

  return (
    <div className="alert-setting">
      {/* 상단 탭 + 수신설정 버튼 */}
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

      {/* 기본 탭 */}
      {activeTab === "1" && (
        <EventSettingPanel
          title="정책 설정"
          isOpen={openPanel}
          onToggle={handleToggle}
          mode="default"
          onPoliciesChange={(updatedPolicies) => setPolicies(updatedPolicies)}
        />
      )}

      {/* 설정 기록 탭 */}
      {activeTab === "2" && (
        <div className="log-panel">
          {policies.length === 0 ? (
            <p>저장된 정책이 없습니다.</p>
          ) : (
            policies.map((policy) => (
              <div key={policy.id} className="log-policy">
                <h4>{policy.name}</h4>
                {policy.events.map((event) => (
                  <div key={event.id} className="log-event">
                    <span>{event.name}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* 수신 설정 모달 */}
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
