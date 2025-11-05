import React from "react";
import clsx from "clsx";
import "./Select.scss";

interface SelectProps {
  placeholder?: string;
  icon?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined";
  disabled?: boolean;
  value?: string;
  bgColor?: "default" | "alt";
  options: { label: string; value: string }[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select: React.FC<SelectProps> = ({
  placeholder,
  icon,
  size = "md",
  variant = "default",
  disabled = false,
  value,
  bgColor = "default",
  options,
  onChange,
}) => {
  return (
    <div
      className={clsx(
        "custom-select",
        `custom-select--${size}`,
        `custom-select--${variant}`,
        `custom-select--bg-${bgColor}`,
        { disabled }
      )}
    >
      {icon && <img src={icon} alt="icon" className="custom-select__icon" />}
      <select value={value} onChange={onChange} disabled={disabled}>
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
