import React from "react";
import "./Switch.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "sm",
}) => {
  return (
    <label className={`toggle-switch toggle-switch--${size}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="toggle-slider" />
    </label>
  );
};

export default Switch;
