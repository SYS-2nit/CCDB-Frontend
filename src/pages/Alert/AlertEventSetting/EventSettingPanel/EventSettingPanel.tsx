import React, { useState } from "react";
import "./EventSettingPanel.scss";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Select from "@/components/Select/Select";
import DaysSelector from "@/components/Select/DaysSelector";
import TimeInput from "@/components/Input/TimeInput";
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
  resources: string;
  eventName: string;
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
    resources: "",
    eventName: "",
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
  const [isReceiveModal, setIsReceiveModal] = useState(false);

  const handleAdd = () => {
    const currentForm = inputForms[0];

    const isInvalid =
      !policyName.trim() ||
      !currentForm.resources.trim() ||
      !currentForm.eventName.trim() ||
      !currentForm.frequency.trim() ||
      currentForm.days.length === 0 ||
      !currentForm.startTime.trim() ||
      !currentForm.endTime.trim();

    if (isInvalid) {
      alert("비어 있는 입력폼을 작성해주세요.");
      return;
    }

    // 새 이벤트 추가
    setCreatedCards((prev) => [...prev, currentForm]);
    setIsInitial(false);

    // 입력폼 초기화 (새 빈 이벤트로)
    setInputForms([createEmptyEvent(createdCards.length + 1)]);
  };

  const handleSave = () => {
    if (createdCards.length === 0) {
      alert("이벤트 하나 이상 추가하세요.");
      return;
    }

    const hasEmptyField = createdCards.some((event) => {
      return (
        !policyName.trim() ||
        !event.resources.trim() ||
        !event.eventName.trim() ||
        !event.frequency.trim() ||
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
    alert(
      "정책이 성공적으로 저장되었습니다. \n설정 기록 탭에서 확인할 수 있습니다."
    );
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

  return (
    <div className="event-panel">
      {/* 정책 설정 헤더 + 수신 설정 버튼 한 줄 */}
      <div className="event-panel-header-row">
        <Input
          placeholder="정책 이름을 입력해주세요."
          size="lg"
          variant="default"
          value={policyName}
          onChange={(e) => setPolicyName(e.target.value)}
        />

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
              {/* 입력폼 */}
              {inputForms.map((event, index) => (
                <div key={event.id} className="event-card">
                  <div className="event-panel__row">
                    <Select
                      label="자원"
                      placeholder="선택해주세요"
                      size="sm"
                      value={event.resources}
                      options={[
                        { label: "CPU", value: "CPU" },
                        { label: "Memory", value: "Memory" },
                        { label: "Session", value: "Session" },
                        { label: "I/O", value: "I/O" },
                        { label: "Storage", value: "Storage" },
                      ]}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, resources: e.target.value }
                              : ev
                          )
                        )
                      }
                    />

                    <Select
                      label="이벤트"
                      placeholder="선택해주세요"
                      size="sm"
                      value={event.eventName}
                      options={[
                        { label: "이벤트 1", value: "이벤트 1" },
                        { label: "이벤트 2", value: "이벤트 2" },
                        { label: "이벤트 3", value: "이벤트 3" },
                        { label: "이벤트 4", value: "이벤트 4" },
                        { label: "이벤트 5", value: "이벤트 5" },
                      ]}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, eventName: e.target.value }
                              : ev
                          )
                        )
                      }
                    />

                    <Select
                      label="누적 횟수"
                      placeholder="1분 후"
                      size="sm"
                      value={event.frequency}
                      options={[
                        { label: "1분 후", value: "1분 후" },
                        { label: "5분 후", value: "5분 후" },
                        { label: "10분후", value: "10분후" },
                        { label: "1시간 후", value: "1시간 후" },
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
                    <Input label="주의" type="number" placeholder="0" />
                    <Input label="위험" type="number" placeholder="0" />
                    <Input label="치명" type="number" placeholder="0" />
                  </div>
                </div>
              ))}

              {/* 이벤트 목록 타이틀 및 리스트 */}
              {!isInitial && createdCards.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div className="event-card__header-list-title">
                      추가된 이벤트 ({createdCards.length})
                    </div>
                  </div>

                  {createdCards.map((card, index) => (
                    <div className="event-card__header-list" key={card.id}>
                      <div className="event-card__header-list-title">
                        {card.name}
                      </div>
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
            </>
          )}

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
        </div>
      )}
    </div>
  );
};

export default EventSettingPanel;
