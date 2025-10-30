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
  mode?: "default" | "log"; // 모드: 기본 or 설정 기록
}

const EventSettingPanel: React.FC<EventSettingPanelProps> = ({
  title,
  isOpen,
  onToggle,
  mode = "default",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [events, setEvents] = useState<string[]>(
    Array.from({ length: 10 }).map((_, i) => `이벤트 ${i + 1}`)
  );
  const [isActive, setIsActive] = useState(true);
  const [frequency, setFrequency] = useState("매번");
  const [days, setDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [levels, setLevels] = useState({
    warning: "주의",
    warningMin: 0,
    warningMax: 0,
    danger: "위험",
    dangerMin: 0,
    dangerMax: 0,
    critical: "장애",
    criticalMin: 0,
    criticalMax: 0,
  });

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleAdd = () => {
    console.log("Edited");
  };

  const handleSave = () => {
    console.log("Saved");
  };

  const handleDelete = () => {
    if (targetIndex !== null) {
      setEvents((prev) => prev.filter((_, i) => i !== targetIndex));
      setTargetIndex(null);
      setIsModalOpen(false);
      console.log("이벤트 1개가 삭제되었습니다.");
    }
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

        {/* 설정 기록 모드일 때만 토글 스위치 표시 */}
        {mode === "log" && (
          <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
            <span className="slider"></span>
          </label>
        )}
      </button>

      {/* 콘텐츠 */}
      {isOpen && (
        <div className="event-panel__content">
          {mode === "default" ? (
            <>
              {/* 자원, 이벤트, 누적 횟수 */}
              <div className="event-panel__row">
                <div className="field">
                  <label>누적 횟수</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
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
                    {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
                      <button
                        key={day}
                        className={days.includes(day) ? "active" : ""}
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field time">
                  <label>시작 시간</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="field time">
                  <label>마감 시간</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
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
                      <div className="dual-slider-wrapper">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={
                            levels[`${key}Min` as keyof typeof levels] as number
                          }
                          onChange={(e) =>
                            setLevels({
                              ...levels,
                              [`${key}Min`]: Math.min(
                                Number(e.target.value),
                                (levels[
                                  `${key}Max` as keyof typeof levels
                                ] as number) - 1
                              ),
                            })
                          }
                        />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={
                            levels[`${key}Max` as keyof typeof levels] as number
                          }
                          onChange={(e) =>
                            setLevels({
                              ...levels,
                              [`${key}Max`]: Math.max(
                                Number(e.target.value),
                                (levels[
                                  `${key}Min` as keyof typeof levels
                                ] as number) + 1
                              ),
                            })
                          }
                        />
                      </div>
                      <div className="slider-labels">
                        <span>
                          {levels[`${key}Min` as keyof typeof levels]}
                          {levels[`${key}Max` as keyof typeof levels]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 버튼 (추가, 저장 버튼) */}
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
          ) : (
            <>
              {/* 설정 기록 모드 */}
              <div className="event-panel__list">
                {events.map((event, i) => (
                  <div key={i} className="event-row">
                    <span>{event}</span>
                    <Button
                      text="삭제"
                      size="sm"
                      variant="error"
                      onClick={() => {
                        setTargetIndex(i); // 클릭한 인덱스 저장
                        setIsModalOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* 삭제 확인 모달 */}
          {isModalOpen && (
            <Modal
              title="이벤트 삭제"
              onClose={() => setIsModalOpen(false)}
              onConfirm={() => handleDelete()}
              confirmText="확인"
              cancelText="취소"
              fields={[
                {
                  label:
                    "이벤트를 삭제하면 더 이상 해당 알림을 받을 수 없습니다.\n" +
                    "삭제된 이벤트는 복구할 수 없습니다.\n" +
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
