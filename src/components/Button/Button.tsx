import "./Button.scss";
import clsx from "clsx";
import React from "react";

type ButtonSize = "sm" | "md";
type ButtonVariant = "primary" | "error" | "white";

interface ButtonProps {
  text?: string;
  icon?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
  bordered?: boolean;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  text,
  icon,
  size = "md",
  variant = "primary",
  bordered = false,
  onClick,
}) => {
  return (
    <button
      className={clsx(
        "custom-btn",
        `custom-btn--${size}`,
        `custom-btn--${variant}`,
        {
          bordered,
        }
      )}
      onClick={onClick}
    >
      {icon && <img src={icon} alt="icon" className="custom-btn__icon" />}
      {text && <div> {text} </div>}
    </button>
  );
};

export default Button;
