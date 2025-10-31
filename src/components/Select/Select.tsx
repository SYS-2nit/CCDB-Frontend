import React from "react";
import clsx from "clsx";
import "./Select.scss";

interface SelectProps {
  label?: string;
  value?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
  size = "md",
}) => {
  return (
    <div className={clsx("select-field", `select-field--${size}`)}>
      {label && <label>{label}</label>}
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
