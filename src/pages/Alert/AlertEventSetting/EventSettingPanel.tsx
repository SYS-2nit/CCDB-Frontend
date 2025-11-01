import React, { useState } from "react";
import "./EventSettingPanel.scss";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Select from "@/components/Select/Select";
import DaysSelector from "@/components/Select/DaysSelector";
import TimeInput from "@/components/Input/TimeInput";
import RangeSliderGroup from "@/components/Slider/RangeSliderGroup";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
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
      <div className="event-panel-header">
        <label>정책 설정</label>
      </div>

      {isOpen && (
        <div className="event-panel__content">
          {/* 기본 정책 설정 화면 */}
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
                    <div className="field">
                      <label>정책 이름</label>
                      <Input
                        placeholder="정책 이름을 입력하세요"
                        size="lg"
                        variant="default"
                        value={policyName}
                        onChange={(e) => setPolicyName(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>

                  {/* 두 번째 줄 */}
                  <div className="event-panel__row">
                    <Select
                      label="누적 횟수"
                      size="lg"
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
                    <Select
                      label="이벤트"
                      size="lg"
                      placeholder="이벤트를 선택해주세요"
                      value={event.eventType}
                      options={[
                        { label: "선택하세요", value: "0" },
                        { label: "이벤트 1", value: "1" },
                        { label: "이벤트 2", value: "2" },
                        { label: "이벤트 3", value: "3" },
                      ]}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, eventType: e.target.value }
                              : ev
                          )
                        )
                      }
                    />
                    <Select
                      label="자원"
                      size="lg"
                      placeholder="자원을 선택해주세요"
                      value={event.resource}
                      options={[
                        { label: "선택하세요", value: "0" },
                        { label: "자원 1", value: "1" },
                        { label: "자원 2", value: "2" },
                        { label: "자원 3", value: "3" },
                      ]}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, resource: e.target.value }
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

                  {/* 슬라이더 */}
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

          {/* 설정 기록 탭 (Log 모드) */}
          {mode === "log" && (
            <div className="event-log__list">
              {policies.length === 0 ? (
                <p className="event-log__empty">저장된 정책이 없습니다.</p>
              ) : (
                policies.map((policy, pIndex) => (
                  <div key={policy.id} className="event-log__policy">
                    <div className="event-log__policy-header">
                      <span className="event-log__policy-name">
                        {policy.name}
                      </span>
                      <Button
                        text="삭제"
                        size="sm"
                        variant="error"
                        onClick={() => {
                          if (confirm("이 정책을 삭제하시겠습니까?")) {
                            const updated = policies.filter(
                              (_, i) => i !== pIndex
                            );
                            setPolicies(updated);
                            if (onPoliciesChange) onPoliciesChange(updated);
                          }
                        }}
                      />
                    </div>

                    <div className="event-log__events">
                      {policy.events.map((event, eIndex) => (
                        <div key={event.id} className="event-log__event-item">
                          <span className="event-log__event-name">
                            {event.name}
                          </span>
                          <Button
                            text="삭제"
                            size="sm"
                            variant="error"
                            onClick={() => {
                              const updatedPolicies = [...policies];
                              updatedPolicies[pIndex].events.splice(eIndex, 1);
                              setPolicies(updatedPolicies);
                              if (onPoliciesChange)
                                onPoliciesChange(updatedPolicies);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
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
        </div>
      )}
    </div>
  );
};

export default EventSettingPanel;
