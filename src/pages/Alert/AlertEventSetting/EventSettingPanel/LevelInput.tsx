import React, { useState, useEffect, useRef } from "react";
import type { ThresholdFormat } from "@/api/Alert/alerts";
import "./LevelInput.scss";

/*
 ******************************************************************
 공동 작성자: 최영준, 오수경
 ******************************************************************
 */

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
  // 입력 중에는 문자열로 관리 (빈 값 허용)
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부에서 value가 변경되면 inputValue도 업데이트 (포커스가 없을 때만)
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

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
  const step =
    thresholdFormat === "PERCENT" ? 1 : thresholdFormat === "MS" ? 10 : 1;

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
    const newValue = e.target.value;

    // 입력 중에는 검증하지 않고 문자열 그대로 저장
    // 숫자가 아니거나 빈 값도 허용 (사용자가 지우고 입력할 수 있도록)
    if (newValue === "" || newValue === "-") {
      setInputValue(newValue);
      return;
    }

    // 숫자만 허용 (소수점 포함)
    const numValue = Number(newValue);
    if (isNaN(numValue)) {
      // 숫자가 아니면 이전 값 유지
      return;
    }

    // 입력 중에는 검증하지 않고 그대로 표시
    setInputValue(newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);

    // 포커스 아웃 시에만 검증 및 값 설정
    const trimmedValue = inputValue.trim();

    // 빈 값이면 최소값 또는 0으로 설정
    if (trimmedValue === "" || trimmedValue === "-") {
      const defaultValue = min !== undefined ? min : 0;
      setInputValue(defaultValue.toString());
      onChange(defaultValue);
      return;
    }

    const numValue = Number(trimmedValue);

    // NaN이면 이전 값으로 복원
    if (isNaN(numValue)) {
      setInputValue(value.toString());
      return;
    }

    // 최종 검증 및 값 조정
    let finalValue = numValue;

    if (min !== undefined && finalValue < min) {
      if (onValidationError) {
        onValidationError(`${label} 값은 ${min}${unit}보다 작을 수 없습니다.`);
      }
      finalValue = min;
    }

    if (max !== undefined && finalValue > max) {
      if (onValidationError) {
        onValidationError(`${label} 값은 ${max}${unit}을 초과할 수 없습니다.`);
      }
      finalValue = max;
    }

    // 최종 값 설정
    setInputValue(finalValue.toString());
    onChange(finalValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // 포커스 시 전체 선택 (사용자가 쉽게 지우고 입력할 수 있도록)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, 0);
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
            ref={inputRef}
            type="text"
            className="level-input__input"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            inputMode="numeric"
            pattern="[0-9]*"
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
