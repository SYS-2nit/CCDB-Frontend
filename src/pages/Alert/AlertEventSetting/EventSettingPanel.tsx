import React, { useState } from "react";
import "./EventSettingPanel.scss";
import ArrowFillBottomIcon from "@/assets/general/arrow-fill-bottom.svg";
import ArrowFillTopIcon from "@/assets/general/arrow-fill-top.svg";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";

interface EventSettingPanelProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  mode?: "default" | "log"; // 탭 (기본, 설정 기록)
  onPoliciesChange?: (policies: Policy[]) => void;
}

interface Policy {
  id: number;
  name: string;
  events: EventCard[];
}

interface EventCard {
  id: number;
  name: string;
  frequency: string;
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
    frequency: "매번",
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
  title,
  isOpen,
  onToggle,
  mode = "default",
  onPoliciesChange,
}) => {
  const [inputForms, setInputForms] = useState<EventCard[]>([
    createEmptyEvent(0),
  ]); // 항상 하나만 존재하는 입력폼
  const [createdCards, setCreatedCards] = useState<EventCard[]>([]); // 누적 카드 목록
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [isInitial, setIsInitial] = useState(true);

  // 추가 버튼 클릭 핸들러
  const handleAdd = () => {
    const newEvent = createEmptyEvent(createdCards.length);
    setInputForms([newEvent]); // 폼은 항상 한 개만 유지
    setCreatedCards((prev) => [...prev, newEvent]); // 헤더 누적
    setIsInitial(false);
  };

  // 삭제 버튼 클릭 핸들러
  const handleConfirmDelete = () => {
    if (targetIndex !== null) {
      setCreatedCards((prev) => prev.filter((_, i) => i !== targetIndex));
      setTargetIndex(null);
      setIsModalOpen(false);

      if (createdCards.length <= 1) {
        setIsInitial(true); // 마지막 카드 삭제 시 초기화
      }
    }
  };

  // 저장 버튼 핸들러
  const handleSave = () => {
    if (createdCards.length === 0) return;

    const newPolicy: Policy = {
      id: policies.length,
      name: `정책 ${policies.length + 1}`,
      events: [...createdCards],
    };

    const updated = [...policies, newPolicy];
    setPolicies(updated);
    setIsInitial(true);

    if (onPoliciesChange) onPoliciesChange(updated);
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

  const updateLevel = (
    eventIndex: number,
    key: keyof EventCard["levels"],
    value: number
  ) => {
    setInputForms((prev) =>
      prev.map((ev, i) =>
        i === eventIndex
          ? {
              ...ev,
              levels: {
                ...ev.levels,
                [key]: value,
              },
            }
          : ev
      )
    );
  };

  return (
    <div className="event-panel">
      {/* 헤더 */}
      <button className="event-panel__header" onClick={onToggle}>
        <img
          src={isOpen ? ArrowFillTopIcon : ArrowFillBottomIcon}
          alt="Toggle Icon"
          width={24}
          height={24}
        />
        <span>{title}</span>
      </button>

      {isOpen && (
        <div className="event-panel__content">
          <div className="event-panel__content-container">
            {/* 기본 탭일 경우 */}
            {mode === "default" && (
              <>
                {/* 누적되는 이벤트 이름 + 삭제버튼 리스트 */}
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

                {/* 입력 폼 (항상 1개) */}
                {inputForms.map((event, index) => (
                  <div key={event.id} className="event-card">
                    {/* 입력 폼 */}
                    <div className="event-panel__row">
                      <div className="field">
                        <label>누적 횟수</label>
                        <select
                          value={event.frequency}
                          onChange={(e) =>
                            setInputForms((prev) =>
                              prev.map((ev, i) =>
                                i === index
                                  ? { ...ev, frequency: e.target.value }
                                  : ev
                              )
                            )
                          }
                        >
                          <option value="매번">매번</option>
                          <option value="10분 후">10분 후</option>
                          <option value="1시간 후">1시간 후</option>
                          <option value="1일 후">1일 후</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>자원</label>
                        <select>
                          <option value="">자원을 선택해주세요</option>
                          <option value="1">자원 1</option>
                          <option value="2">자원 2</option>
                          <option value="3">자원 3</option>
                        </select>
                      </div>

                      <div className="field">
                        <label>이벤트</label>
                        <select>
                          <option value="">이벤트를 선택해주세요</option>
                          <option value="1">이벤트 1</option>
                          <option value="2">이벤트 2</option>
                          <option value="3">이벤트 3</option>
                        </select>
                      </div>
                    </div>

                    {/* 요일, 시간 */}
                    <div className="event-panel__row">
                      <div className="field">
                        <label>요일</label>
                        <div className="days">
                          {["월", "화", "수", "목", "금", "토", "일"].map(
                            (day) => (
                              <button
                                key={day}
                                className={
                                  event.days.includes(day) ? "active" : ""
                                }
                                onClick={() => toggleDay(index, day)}
                              >
                                {day}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <div className="field time">
                        <label>시작 시간</label>
                        <input
                          type="time"
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
                      </div>

                      <div className="field time">
                        <label>마감 시간</label>
                        <input
                          type="time"
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
                    </div>

                    {/* 슬라이더 */}
                    <div className="event-panel__sliders">
                      {["주의", "위험", "치명"].map((label) => {
                        const key =
                          label === "주의"
                            ? "warning"
                            : label === "위험"
                            ? "danger"
                            : "critical";
                        return (
                          <div key={label} className="slider-group">
                            <label>{label}</label>
                            <div
                              className="dual-slider-wrapper"
                              style={
                                {
                                  "--min":
                                    event.levels[
                                      `${key}Min` as keyof typeof event.levels
                                    ],
                                  "--max":
                                    event.levels[
                                      `${key}Max` as keyof typeof event.levels
                                    ],
                                } as React.CSSProperties
                              }
                            >
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={
                                  event.levels[
                                    `${key}Min` as keyof typeof event.levels
                                  ]
                                }
                                onChange={(e) =>
                                  updateLevel(
                                    index,
                                    `${key}Min` as keyof EventCard["levels"],
                                    Math.min(
                                      Number(e.target.value),
                                      event.levels[
                                        `${key}Max` as keyof typeof event.levels
                                      ] - 1
                                    )
                                  )
                                }
                              />
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={
                                  event.levels[
                                    `${key}Max` as keyof typeof event.levels
                                  ]
                                }
                                onChange={(e) =>
                                  updateLevel(
                                    index,
                                    `${key}Max` as keyof EventCard["levels"],
                                    Math.max(
                                      Number(e.target.value),
                                      event.levels[
                                        `${key}Min` as keyof typeof event.levels
                                      ] + 1
                                    )
                                  )
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* 하단 버튼 */}
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
                  />
                </div>
              </>
            )}

            {/* 설정 기록 탭일 경우 */}
            {mode === "log" && (
              <div className="policy-block">
                {policies.length === 0 ? (
                  <p>저장된 정책이 없습니다.</p>
                ) : (
                  policies.map((policy) => (
                    <div key={policy.id}>
                      {policy.events.map((ev) => (
                        <div key={ev.id} className="policy-event">
                          <span>{ev.name}</span>
                          <Button text="삭제" size="sm" variant="error" />
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

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
                    "이벤트를 삭제하면 더 이상 해당 알림을 받을 수 없습니다.\n" +
                    "정말 삭제하시겠습니까?",
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
