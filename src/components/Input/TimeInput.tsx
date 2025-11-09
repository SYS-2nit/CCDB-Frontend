import React from "react";
import "./TimeInput.scss";

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// 시간 선택
const TimeInput: React.FC<TimeInputProps> = ({ label, value, onChange }) => (
  <div className="time-input">
    <label>{label}</label>
    <input type="time" value={value} onChange={onChange} />
  </div>
);

export default TimeInput;
