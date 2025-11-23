import React from "react";
import Button from "@/components/Button/Button";
import { INTERVAL_OPTIONS } from "../constants";
import type { IntervalType } from "../types";

interface IntervalButtonsProps {
  value: IntervalType;
  onChange: (value: IntervalType) => void;
  className?: string;
}

export const IntervalButtons: React.FC<IntervalButtonsProps> = ({
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={className}>
      {INTERVAL_OPTIONS.map((option) => (
        <Button
          key={option.value}
          text={option.label}
          size="sm"
          variant={value === option.value ? "primary" : "white"}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
};

