import React from "react";
import clsx from "clsx";
import "./DateInput.scss";

interface DateInputProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined";
  disabled?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  size = "sm",
  variant = "default",
  disabled = false,
  value,
  onChange,
}) => {
  return (
    <div className="date-input">
      {label && <label className="date-input__label">{label}</label>}
      <input
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
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
