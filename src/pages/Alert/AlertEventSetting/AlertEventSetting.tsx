import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState, useEffect } from "react";
import "./AlertEventSetting.scss";
import Modal, { type FieldItem } from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import Switch from "@/components/Toggle/Switch";
import Pagination from "@/components/Pagination/Pagination";
import type { EventCard } from "./EventSettingPanel/EventSettingPanel";
import EventSettingPanel from "./EventSettingPanel/EventSettingPanel";

type AlertTabType = "1" | "2";

interface Policy {
  id: number;
  name: string;
  events: EventCard[];
}

const ITEMS_PER_PAGE = 3;

const AlertEventSetting: React.FC = () => {
  const [isReceiveModal, setIsReceiveModal] = useState(false);
  const [isEventModal, setIsEventModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AlertTabType>("1");
  const [openPanel, setOpenPanel] = useState<boolean>(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyStates, setPolicyStates] = useState<boolean[]>([]);
  const [eventStates, setEventStates] = useState<boolean[][]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);

  const tabs = [
    { id: "1", label: "기본" },
    { id: "2", label: "설정 기록" },
  ] as const;

  const handleToggle = () => setOpenPanel((prev) => !prev);

  /* 정책 / 이벤트 상태 초기화 */
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

  /* 정책 on/off */
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

  /* 이벤트 on/off */
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

  /* 이벤트 클릭 시 상세 모달 */
  const handleEventClick = (event: EventCard) => {
    setSelectedEvent(event);
    setIsEventModal(true);
  };

  /* 정책 삭제 */
  const handleDeletePolicy = (policyIndex: number) => {
    setPolicies((prev) => prev.filter((_, i) => i !== policyIndex));
    setPolicyStates((prev) => prev.filter((_, i) => i !== policyIndex));
    setEventStates((prev) => prev.filter((_, i) => i !== policyIndex));
  };

  /* 페이지네이션 계산 */
  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPolicies = policies.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  /* 이벤트 상세 모달 필드 */
  const eventFields: FieldItem[] = selectedEvent
    ? [
        {
          label: "이벤트 이름",
          type: "text",
          placeholder: selectedEvent.name,
        },
        {
          label: "누적 횟수",
          type: "text",
          placeholder: selectedEvent.eventType,
        },
        {
          label: "자원",
          type: "text",
          placeholder: selectedEvent.eventName,
        },
        {
          label: "요일",
          type: "text",
          placeholder: selectedEvent.days.join(", "),
        },
        {
          label: "시작 시간",
          type: "text",
          placeholder: selectedEvent.startTime,
        },
        {
          label: "종료 시간",
          type: "text",
          placeholder: selectedEvent.endTime,
        },
        {
          label: "레벨 설정",
          type: "table",
          tableHeaders: ["구간", "Min", "Max"],
          tableData: [
            {
              구간: "Warning",
              Min: selectedEvent.levels.warningMin.toString(),
              Max: selectedEvent.levels.warningMax.toString(),
            },
            {
              구간: "Danger",
              Min: selectedEvent.levels.dangerMin.toString(),
              Max: selectedEvent.levels.dangerMax.toString(),
            },
            {
              구간: "Critical",
              Min: selectedEvent.levels.criticalMin.toString(),
              Max: selectedEvent.levels.criticalMax.toString(),
            },
          ],
        },
      ]
    : [];

  return (
    <div className="alert-setting">
      {/* 상단 탭 */}

      <TabMenu tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

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
            <div className="log-policy-empty">저장된 정책이 없습니다.</div>
          ) : (
            <>
              {paginatedPolicies.map((policy, policyIndex) => {
                const globalIndex = startIdx + policyIndex;
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
                        className="log-policy-container-content clickable"
                        onClick={() => handleEventClick(event)}
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
              {policies.length > ITEMS_PER_PAGE && (
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
      {isReceiveModal && (
        <Modal
          title="수신 설정"
          cancelText="테스트"
          confirmText="저장"
          onClose={() => setIsReceiveModal(false)}
          onConfirm={() => setIsReceiveModal(false)}
          fields={[
            {
              label: "Slack",
              type: "textarea",
              placeholder: "https://hooks.slack.com/services/...",
            },
            {
              label: "Email",
              type: "textarea",
              placeholder: "example@company.com",
            },
            {
              label: "Critical",
              type: "select",
              placeholder: "주요 알림 채널을 선택해주세요.",
              options: ["Slack", "Email"],
            },
            {
              label: "Warning",
              type: "select",
              placeholder: "주요 알림 채널을 선택해주세요.",
              options: ["Slack", "Email"],
            },
          ]}
          theme="light"
        />
      )}

      {/* 이벤트 상세 모달 */}
      {selectedEvent && isEventModal && (
        <Modal
          title="이벤트 상세"
          onClose={() => {
            setIsEventModal(false);
            setSelectedEvent(null);
          }}
          onConfirm={() => {
            setIsEventModal(false);
            setSelectedEvent(null);
          }}
          fields={eventFields}
          confirmText="닫기"
          cancelText="취소"
          theme="light"
        />
      )}
    </div>
  );
};

export default AlertEventSetting;
