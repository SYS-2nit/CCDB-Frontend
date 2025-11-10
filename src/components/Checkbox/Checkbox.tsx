import React from "react";
import clsx from "clsx";
import "./Checkbox.scss";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
}) => {
  return (
    <label
      className={clsx("custom-checkbox", `custom-checkbox--${size}`, {
        disabled,
      })}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="custom-checkbox__box" />
      {label && <span className="custom-checkbox__label">{label}</span>}
    </label>
  );
};

export default Checkbox;
