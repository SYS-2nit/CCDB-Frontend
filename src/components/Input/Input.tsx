import React from "react";
import clsx from "clsx";
import "./Input.scss";

type InputSize = "sm" | "md";
type InputVariant = "default" | "outlined";

interface InputProps {
  placeholder?: string;
  icon?: string;
  size?: InputSize;
  variant?: InputVariant;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  placeholder,
  icon,
  size = "md",
  variant = "default",
  disabled = false,
  onChange,
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
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
