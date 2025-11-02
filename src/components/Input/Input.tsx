import React from "react";
import clsx from "clsx";
import "./Input.scss";

type InputSize = "sm" | "md" | "lg";
type InputVariant = "default" | "outlined";

interface InputProps {
  placeholder?: string;
  icon?: string;
  size?: InputSize;
  variant?: InputVariant;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  icon,
  size = "md",
  variant = "default",
  disabled = false,
  value,
  onChange,
  onKeyDown,
}) => {
  return (
    <div
      className={clsx(
        "custom-input",
        `custom-input--${size}`,
        `custom-input--${variant}`
      )}
    >
      {icon && <img src={icon} alt="icon" className="custom-input__icon" />}
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default Input;
