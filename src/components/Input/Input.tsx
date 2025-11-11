import React from "react";
import clsx from "clsx";
import "./Input.scss";

interface InputProps {
  placeholder?: string;
  label?: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default";
  type?: "text" | "number";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  label,
  icon,
  size = "sm",
  variant = "default",
  type = "text",
  value,
  onChange,
  onKeyDown,
}) => {
  return (
    <div className="custom">
      {/* 제목 */}
      <div className="custom-label">{label}</div>

      {/* 입력란 */}
      <div
        className={clsx(
          "custom-input",
          `custom-input--${size}`,
          `custom-input--${variant}`
        )}
      >
        {icon && <img src={icon} alt="icon" className="custom-input__icon" />}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </div>
    </div>
  );
};

export default Input;
