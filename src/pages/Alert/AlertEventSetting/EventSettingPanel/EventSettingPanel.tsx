import React, { useState } from "react";
import "./EventSettingPanel.scss";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Select from "@/components/Select/Select";
import DaysSelector from "@/components/Select/DaysSelector";
import TimeInput from "@/components/Input/TimeInput";
import RangeSliderGroup from "@/components/Slider/RangeSliderGroup";
import type { TabType } from "@/pages/Dashboard/InstanceMap/Dashboard/Dashboard";
import Dashboard from "@/pages/Dashboard/InstanceMap/Dashboard/Dashboard";
import ReceiveIcon from "@/assets/general/receive.svg";

interface EventSettingPanelProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  mode?: "default" | "log";
  onPoliciesChange?: (policies: Policy[]) => void;
}

interface Policy {
  id: number;
  name: string;
  events: EventCard[];
}

export interface EventCard {
  id: number;
  name: string;
  frequency: string;
  eventType: string;
  resource: string;
  days: string[];
  startTime: string;
  endTime: string;
  levels: {
    warningMin: number;
    warningMax: number;
    dangerMin: number;
    dangerMax: number;
    criticalMin: number;
    criticalMax: number;
  };
}

function createEmptyEvent(index: number): EventCard {
  return {
    id: index,
    name: `이벤트 ${index + 1}`,
    frequency: "",
    eventType: "",
    resource: "",
    days: [],
    startTime: "",
    endTime: "",
    levels: {
      warningMin: 0,
      warningMax: 100,
      dangerMin: 0,
      dangerMax: 100,
      criticalMin: 0,
      criticalMax: 100,
    },
  };
}

const EventSettingPanel: React.FC<EventSettingPanelProps> = ({
  isOpen,
  mode = "default",
  onPoliciesChange,
}) => {
  const [policyName, setPolicyName] = useState("");
  const [inputForms, setInputForms] = useState<EventCard[]>([
    createEmptyEvent(0),
  ]);
  const [createdCards, setCreatedCards] = useState<EventCard[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isInitial, setIsInitial] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedResourceTab] = useState<TabType>("main");
  const [isReceiveModal, setIsReceiveModal] = useState(false);

  const handleAdd = () => {
    const currentForm = inputForms[0];

    if (!policyName.trim()) {
      alert("정책 이름을 입력하세요.");
      return;
    }

    const isInvalid =
      currentForm.eventType === "0" ||
      currentForm.resource === "0" ||
      currentForm.days.length === 0 ||
      !currentForm.startTime.trim() ||
      !currentForm.endTime.trim();

    if (isInvalid) {
      alert("비어 있는 입력폼을 작성해주세요.");
      return;
    }

    const newEvent = createEmptyEvent(createdCards.length);
    setInputForms([newEvent]);
    setCreatedCards((prev) => [...prev, currentForm]);
    setIsInitial(false);
  };

  const handleSave = () => {
    if (createdCards.length === 0) {
      alert("이벤트 하나 이상 추가하세요.");
      return;
    }

    if (!policyName.trim()) {
      alert("정책 이름을 입력하세요.");
      return;
    }

    const hasEmptyField = createdCards.some((event) => {
      return (
        event.eventType === "0" ||
        event.resource === "0" ||
        event.days.length === 0 ||
        !event.startTime.trim() ||
        !event.endTime.trim()
      );
    });

    if (hasEmptyField) {
      alert("비어 있는 입력폼을 작성해주세요.");
      return;
    }

    const newPolicy: Policy = {
      id: policies.length,
      name: policyName,
      events: createdCards,
    };

    const updated = [...policies, newPolicy];
    setPolicies(updated);
    setIsInitial(true);
    setCreatedCards([]);
    setInputForms([createEmptyEvent(0)]);

    if (onPoliciesChange) onPoliciesChange(updated);
    alert("정책이 성공적으로 저장되었습니다!");
  };

  const toggleDay = (eventIndex: number, day: string) => {
    setInputForms((prev) =>
      prev.map((ev, i) =>
        i === eventIndex
          ? {
              ...ev,
              days: ev.days.includes(day)
                ? ev.days.filter((d) => d !== day)
                : [...ev.days, day],
            }
          : ev
      )
    );
  };

  const handleConfirmDelete = () => {
    if (targetIndex !== null) {
      setCreatedCards((prev) => prev.filter((_, i) => i !== targetIndex));
      setTargetIndex(null);
      setIsModalOpen(false);
      if (createdCards.length <= 1) setIsInitial(true);
    }
  };

  const updateLevel = (
    eventIndex: number,
    key: keyof EventCard["levels"],
    value: number
  ) => {
    setInputForms((prev) =>
      prev.map((ev, i) =>
        i === eventIndex
          ? { ...ev, levels: { ...ev.levels, [key]: value } }
          : ev
      )
    );
  };

  return (
    <div className="event-panel">
      {/* 정책 설정 헤더 + 수신 설정 버튼 한 줄 */}
      <div className="event-panel-header-row">
        <label className="event-panel-header__title">정책 설정</label>
        <Button
          text="수신 설정"
          size="sm"
          variant="white"
          icon={ReceiveIcon}
          onClick={() => setIsReceiveModal(true)}
        />
      </div>

      {isOpen && (
        <div className="event-panel__content">
          {mode === "default" && (
            <>
              {!isInitial && (
                <div className="event-card__header-list">
                  {createdCards.map((card, index) => (
                    <div key={card.id} className="event-card__header">
                      <span>{card.name}</span>
                      <Button
                        text="삭제"
                        size="sm"
                        variant="error"
                        onClick={() => {
                          setTargetIndex(index);
                          setIsModalOpen(true);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {inputForms.map((event, index) => (
                <div key={event.id} className="event-card">
                  {/* 정책 이름 */}
                  <div className="event-panel__row">
                    <Input
                      label="정책 이름"
                      placeholder="정책 이름을 입력해주세요."
                      size="sm"
                      variant="default"
                      value={policyName}
                      onChange={(e) => setPolicyName(e.target.value)}
                    />
                    <Select
                      size="sm"
                      value={event.frequency}
                      options={[
                        { label: "매번", value: "매번" },
                        { label: "10분 후", value: "10분 후" },
                        { label: "1시간 후", value: "1시간 후" },
                        { label: "1일 후", value: "1일 후" },
                      ]}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, frequency: e.target.value }
                              : ev
                          )
                        )
                      }
                    />
                  </div>

                  {/* 요일 + 시간 */}
                  <div className="event-panel__row">
                    <div className="field">
                      <label>요일</label>
                      <DaysSelector
                        selectedDays={event.days}
                        onToggle={(day) => toggleDay(index, day)}
                      />
                    </div>
                    <TimeInput
                      label="시작 시간"
                      value={event.startTime}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, startTime: e.target.value }
                              : ev
                          )
                        )
                      }
                    />
                    <TimeInput
                      label="종료 시간"
                      value={event.endTime}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, endTime: e.target.value }
                              : ev
                          )
                        )
                      }
                    />
                  </div>

                  <div className="event-panel__row slider-row">
                    <RangeSliderGroup
                      levels={event.levels}
                      onChange={(key, value) => updateLevel(index, key, value)}
                    />
                  </div>
                </div>
              ))}
            </>
          )}

          {/* 하단 버튼 */}
          {mode === "default" && (
            <div className="event-panel__actions">
              <Button
                text="추가"
                size="sm"
                variant="white"
                onClick={handleAdd}
              />
              <Button
                text="저장"
                size="sm"
                variant="primary"
                onClick={handleSave}
                disabled={createdCards.length === 0}
              />
            </div>
          )}

          {/* 삭제 모달 */}
          {isModalOpen && (
            <Modal
              title="이벤트 삭제"
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleConfirmDelete}
              confirmText="확인"
              cancelText="취소"
              fields={[
                {
                  label:
                    "이벤트를 삭제하면 더 이상 해당 알림을 받을 수 없습니다.\n정말 삭제하시겠습니까?",
                },
              ]}
            />
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

          {/* Dashboard 모달 */}
          {showDashboard && (
            <Modal
              title="자원 대시보드 미리보기"
              onClose={() => setShowDashboard(false)}
              confirmText="닫기"
              size="lg"
              theme="light"
            >
              <div className="dashboard-modal-content">
                <Dashboard initialTab={selectedResourceTab} />
              </div>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};

export default EventSettingPanel;
