import React from "react";
import type { ThresholdFormat } from "@/api/alerts";
import "./LevelInput.scss";

interface LevelInputProps {
  label: string;
  value: number;
  thresholdFormat: ThresholdFormat;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onValidationError?: (message: string) => void;
}

const LevelInput: React.FC<LevelInputProps> = ({
  label,
  value,
  thresholdFormat,
  min,
  max,
  onChange,
  onValidationError,
}) => {
  // 메트릭 포맷에 따른 단위 표시
  const getUnit = (format: ThresholdFormat): string => {
    switch (format) {
      case "PERCENT":
        return "%";
      case "MBPS":
        return "MBPS";
      case "MS":
        return "MS";
      case "COUNT":
        return "COUNT";
      default:
        return "";
    }
  };

  const unit = getUnit(thresholdFormat);
  const step = thresholdFormat === "PERCENT" ? 1 : thresholdFormat === "MS" ? 10 : 1;

  const handleIncrement = () => {
    const newValue = value + step;
    if (max !== undefined && newValue > max) {
      if (onValidationError) {
        onValidationError(`${label} 값은 ${max}${unit}을 초과할 수 없습니다.`);
      }
      return;
    }
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = value - step;
    if (min !== undefined && newValue < min) {
      if (onValidationError) {
        onValidationError(`${label} 값은 ${min}${unit}보다 작을 수 없습니다.`);
      }
      return;
    }
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(0);
      return;
    }
    const numValue = Number(inputValue);
    if (isNaN(numValue)) {
      return;
    }
    if (min !== undefined && numValue < min) {
      if (onValidationError) {
        onValidationError(`${label} 값은 ${min}${unit}보다 작을 수 없습니다.`);
      }
      onChange(min);
      return;
    }
    if (max !== undefined && numValue > max) {
      if (onValidationError) {
        onValidationError(`${label} 값은 ${max}${unit}을 초과할 수 없습니다.`);
      }
      onChange(max);
      return;
    }
    onChange(numValue);
  };

  return (
    <div className="level-input">
      <label className="level-input__label">{label}</label>
      <div className="level-input__container">
        <button
          type="button"
          className="level-input__button level-input__button--decrement"
          onClick={handleDecrement}
          disabled={min !== undefined && value <= min}
        >
          −
        </button>
        <div className="level-input__value-container">
          <input
            type="number"
            className="level-input__input"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
          />
          <span className="level-input__unit">{unit}</span>
        </div>
        <button
          type="button"
          className="level-input__button level-input__button--increment"
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default LevelInput;
