import React from "react";
import clsx from "clsx";
import "./Select.scss";

interface SelectProps {
  label?: string;
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
  label,
  icon,
  size = "sm",
  variant = "default",
  disabled = false,
  value,
  bgColor = "default",
  options,
  onChange,
}) => {
  return (
    <div className="custom-select">
      {label && <label className="custom-select__label">{label}</label>}

      <div
        className={clsx(
          "custom-select__wrapper",
          `custom-select__wrapper--${size}`,
          `custom-select__wrapper--${variant}`,
          `custom-select__wrapper--bg-${bgColor}`,
          { disabled }
        )}
      >
        {icon && <img src={icon} alt="icon" className="custom-select__icon" />}
        <select value={value} onChange={onChange} disabled={disabled}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="custom-select__arrow" />
      </div>
    </div>
  );
};

export default Select;
