import React from "react";
import clsx from "clsx";
import "./DateInput.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface DateInputProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined";
  disabled?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
  type?: "date" | "month";
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  size = "sm",
  variant = "default",
  disabled = false,
  value,
  onChange,
  min,
  max,
  type = "date",
}) => {
  return (
    <div className="date-input">
      {label && <label className="date-input__label">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        className={clsx(
          "date-input__field",
          `date-input__field--${size}`,
          `date-input__field--${variant}`,
          { disabled }
        )}
      />
    </div>
  );
};

export default DateInput;
