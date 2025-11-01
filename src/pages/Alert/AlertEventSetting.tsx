import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState, useEffect } from "react";
import "./AlertEventSetting.scss";
import ReceiveIcon from "@/assets/general/receive.svg";
import Modal from "@/components/Modal/Modal";
import EventSettingPanel, {
  type EventCard,
} from "./AlertEventSetting/EventSettingPanel";
import Button from "@/components/Button/Button";
import Switch from "@/components/Toggle/Switch";
import Pagination from "@/components/Pagination/Pagination";

type AlertTabType = "1" | "2";

interface Policy {
  id: number;
  name: string;
  events: EventCard[];
}

const ITEMS_PER_PAGE = 3; // 한 페이지당 정책 수

const AlertEventSetting: React.FC = () => {
  const [isModal, setIsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AlertTabType>("1");
  const [openPanel, setOpenPanel] = useState<boolean>(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyStates, setPolicyStates] = useState<boolean[]>([]);
  const [eventStates, setEventStates] = useState<boolean[][]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const tabs = [
    { id: "1", label: "기본" },
    { id: "2", label: "설정 기록" },
  ] as const;

  const handleToggle = () => setOpenPanel((prev) => !prev);

  /* 정책 / 이벤트 상태 동기화 초기화 */
  useEffect(() => {
    setPolicyStates((prev) => {
      const next = [...prev];
      while (next.length < policies.length) next.push(false);
      while (next.length > policies.length) next.pop();
      return next;
    });

    setEventStates((prev) =>
      policies.map((p, i) => {
        const prevArr = prev[i] || [];
        const next = [...prevArr];
        while (next.length < p.events.length) next.push(false);
        while (next.length > p.events.length) next.pop();
        return next;
      })
    );
  }, [policies]);

  /* 정책 스위치 on/off → 하위 전체 제어 */
  const handlePolicyToggle = (policyIndex: number, checked: boolean) => {
    setPolicyStates((prev) => {
      const updated = [...prev];
      updated[policyIndex] = checked;
      return updated;
    });

    setEventStates((prev) => {
      const updated = [...prev];
      updated[policyIndex] = updated[policyIndex].map(() => checked);
      return updated;
    });
  };

  /* 개별 이벤트 on/off → 부모 정책 반영 */
  const handleEventToggle = (
    policyIndex: number,
    eventIndex: number,
    checked: boolean
  ) => {
    setEventStates((prev) => {
      const updated = [...prev];
      updated[policyIndex][eventIndex] = checked;

      const hasActive = updated[policyIndex].some(Boolean);
      setPolicyStates((prevPolicy) => {
        const newPolicy = [...prevPolicy];
        newPolicy[policyIndex] = hasActive;
        return newPolicy;
      });

      return updated;
    });
  };

  /* 정책 삭제 시 동기화 */
  const handleDeletePolicy = (policyIndex: number) => {
    setPolicies((prev) => prev.filter((_, i) => i !== policyIndex));
    setPolicyStates((prev) => prev.filter((_, i) => i !== policyIndex));
    setEventStates((prev) => prev.filter((_, i) => i !== policyIndex));
  };

  /* 페이지네이션 관련 계산 */
  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPolicies = policies.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  return (
    <div className="alert-setting">
      {/* 상단 탭 + 수신 설정 버튼 */}
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
        <div className="log-policy">
          {policies.length === 0 ? (
            <p>저장된 정책이 없습니다.</p>
          ) : (
            <>
              {paginatedPolicies.map((policy, policyIndex) => {
                const globalIndex = startIdx + policyIndex; // 실제 정책 인덱스
                return (
                  <div
                    key={policy.id}
                    className={`log-policy-container ${
                      policyStates[globalIndex] ? "" : "disabled"
                    }`}
                  >
                    {/* 정책 헤더 */}
                    <div className="log-policy-container-title">
                      <div className="log-policy-container-title-left">
                        <Switch
                          checked={policyStates[globalIndex] || false}
                          onChange={(checked) =>
                            handlePolicyToggle(globalIndex, checked)
                          }
                          size="sm"
                        />
                        {policy.name}
                      </div>
                      <Button
                        text="삭제"
                        size="sm"
                        variant="error"
                        onClick={() => handleDeletePolicy(globalIndex)}
                      />
                    </div>

                    {/* 이벤트 리스트 */}
                    {policy.events.map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className="log-policy-container-content"
                      >
                        <Switch
                          checked={
                            eventStates[globalIndex]?.[eventIndex] || false
                          }
                          onChange={(checked) =>
                            handleEventToggle(globalIndex, eventIndex, checked)
                          }
                          size="sm"
                        />
                        <div>{event.name}</div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="log-policy__pagination">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
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
