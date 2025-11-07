import React from "react";
import "./DateInput.scss";

interface DateInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange }) => (
  <div className="date-input">
    <label>{label}</label>
    <input type="date" value={value} onChange={onChange} />
  </div>
);

export default DateInput;
