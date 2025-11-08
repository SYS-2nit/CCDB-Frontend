import React from "react";
import "./DaysSelector.scss";

interface DaysSelectorProps {
  selectedDays: string[];
  onToggle: (day: string) => void;
}

// 요일 선택
const DaysSelector: React.FC<DaysSelectorProps> = ({
  selectedDays,
  onToggle,
}) => {
  const days = ["월", "화", "수", "목", "금", "토", "일"];

  return (
    <div className="days-selector">
      {days.map((day) => (
        <button
          key={day}
          className={selectedDays.includes(day) ? "active" : ""}
          onClick={() => onToggle(day)}
        >
          {day}
        </button>
      ))}
    </div>
  );
};

export default DaysSelector;
