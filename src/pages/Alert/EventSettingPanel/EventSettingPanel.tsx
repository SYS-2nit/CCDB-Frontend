import React, { useState } from "react";
import "./EventSettingPanel.scss";

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
  const [eventName, setEventName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [graphName, setGraphName] = useState("");
  const [frequency, setFrequency] = useState("매번");
  const [days, setDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [levels, setLevels] = useState({
    warning: 0,
    danger: 0,
    critical: 0,
  });

  const toggleDay = (day: string) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    console.log("Saved", eventName);
  };

  const handleEdit = () => {
    console.log("Edited", eventName);
  };

  const handleDelete = () => {
    console.log("Deleted", eventName);
  };

  return (
    <div className="event-panel">
      {/* 헤더 (아이콘 + 제목 + 토글(설정 기록 탭만)) */}
      <button className="event-panel__header" onClick={onToggle}>
        <span className="arrow">{isOpen ? "▲" : "▼"}</span>
        <span>{mode == "default" ? title : "이벤트 이름"}</span>
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

      {isOpen && (
        <div className="event-panel__content">
          <div className="event-panel__row">
            <div className="field">
              <label>이벤트 이름</label>
              <input
                type="text"
                placeholder="이벤트 이름을 입력해주세요."
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            {mode === "default" && (
              <div className="field">
                <label>그래프 이름</label>
                <select
                  value={graphName}
                  onChange={(e) => setGraphName(e.target.value)}
                >
                  <option value="그래프 이름을 선택해주세요.">
                    그래프 이름을 선택해주세요.
                  </option>
                  <option value="그래프 이름 1">그래프 이름 1</option>
                  <option value="그래프 이름 2">그래프 이름 2</option>
                  <option value="그래프 이름 3">그래프 이름 3</option>
                </select>
              </div>
            )}

            <div className="field">
              <label>누적 횟수</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="매번">매번</option>
                <option value="매일">10분 후</option>
                <option value="매일">1시간 후</option>
                <option value="매일">1일 후</option>
              </select>
            </div>
          </div>

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

          <div className="event-panel__sliders">
            {["주의", "위험", "치명"].map((label) => {
              const key =
                label === "주의"
                  ? "warning"
                  : label === "위험"
                  ? "danger"
                  : "critical";
              const value = levels[key];

              return (
                <div key={label} className="slider-group">
                  <label>{label}</label>

                  <div className="slider-wrapper">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) =>
                        setLevels({
                          ...levels,
                          [key]: Number(e.target.value),
                        })
                      }
                      style={
                        {
                          "--value": `${value}`,
                        } as React.CSSProperties
                      }
                    />

                    {/* 핸들 위 숫자 라벨 */}
                    <div
                      className="slider-value"
                      style={{
                        left: `calc(${value}% - 10px)`, // 핸들 위치에 맞게 이동
                      }}
                    >
                      {value}
                    </div>
                  </div>

                  {/* 최소/최대값 표시 */}
                  <div className="slider-labels">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="event-panel__actions">
            {mode === "log" && (
              <button className="delete" onClick={handleDelete}>
                삭제
              </button>
            )}
            <button
              className={mode === "default" ? "save" : "edit"}
              onClick={mode === "default" ? handleSave : handleEdit}
            >
              {mode === "default" ? "저장" : "수정"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSettingPanel;
