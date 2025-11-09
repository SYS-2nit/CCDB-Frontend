import React from "react";
import clsx from "clsx";
import "./Select.scss";

interface SelectProps {
  placeholder?: string;
<<<<<<< HEAD
=======
  label?: string;
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
<<<<<<< HEAD
  icon,
  size = "md",
=======
  label,
  icon,
  size = "sm",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
  variant = "default",
  disabled = false,
  value,
  bgColor = "default",
  options,
  onChange,
}) => {
  return (
<<<<<<< HEAD
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
=======
    <div className="custom-select">
      {label && <label className="custom-select__label">{label}</label>}

      <div
        className={clsx(
          "custom-select__wrapper",
          `custom-select__wrapper--${size}`,
          `custom-select__wrapper--${variant}`,
          `custom-select__wrapper--bg-${bgColor}`,
          { disabled }
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
        )}
      >
        {icon && <img src={icon} alt="icon" className="custom-select__icon" />}

        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="custom-select__element"
        >
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

        <span className="custom-select__arrow" />
      </div>
    </div>
  );
};

export default Select;
