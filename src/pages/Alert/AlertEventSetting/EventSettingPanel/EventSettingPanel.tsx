import React, { useState } from "react";
import "./EventSettingPanel.scss";

interface EventSettingPanelProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}

const EventSettingPanel: React.FC<EventSettingPanelProps> = ({
  title,
  isOpen,
  onToggle,
}) => {
  const [eventName, setEventName] = useState("");
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
    console.log({
      eventName,
      graphName,
      frequency,
      days,
      startTime,
      endTime,
      levels,
    });
  };

  return (
    <div className="event-panel">
      <button className="event-panel__header" onClick={onToggle}>
        <span className="arrow">{isOpen ? "▲" : "▼"}</span>
        <span>{title}</span>
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
            <div className="field">
              <label>그래프 이름</label>
              <input
                type="text"
                placeholder="그래프 이름을 선택해주세요."
                value={graphName}
                onChange={(e) => setGraphName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>누적 횟수</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="매번">매번</option>
                <option value="매일">매일</option>
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
            {["주의", "위험", "치명"].map((label) => (
              <div key={label} className="slider-group">
                <label>{label}</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={
                    levels[
                      label === "주의"
                        ? "warning"
                        : label === "위험"
                        ? "danger"
                        : "critical"
                    ]
                  }
                  onChange={(e) =>
                    setLevels({
                      ...levels,
                      [label === "주의"
                        ? "warning"
                        : label === "위험"
                        ? "danger"
                        : "critical"]: Number(e.target.value),
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div className="event-panel__actions">
            <button onClick={handleSave}>저장</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventSettingPanel;
