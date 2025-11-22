import React from "react";
import "./BarGauge.scss";
import { formatTooltipNumber } from "@/utils/numberFormatter";
import { formatTime } from "@/utils/timeFormatter";

interface BarGaugeProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  isTime?: boolean; // 시간 단위 변환 여부 (마이크로초 → us/ms/sec/min)
}

const BarGauge: React.FC<BarGaugeProps> = ({
  value,
  max = 100,
  showPercentage = true,
  isTime = false,
}) => {
  // 바의 너비 계산
  const barWidth =
    max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  const displayValue = showPercentage
    ? barWidth.toFixed(1)
    : isTime
    ? formatTime(value)
    : formatTooltipNumber(value);

  // 시간 단위 툴팁 생성
  const getTimeTooltip = (value: string): string | undefined => {
    if (!isTime || showPercentage) return undefined;
    
    if (value.includes(" min")) {
      return "minutes";
    } else if (value.includes(" sec")) {
      return "seconds";
    } else if (value.includes(" ms")) {
      return "milliseconds";
    } else if (value.includes(" us")) {
      return "microseconds";
    }
    return undefined;
  };

  const tooltip = getTimeTooltip(displayValue);

  return (
    <div className="bar-gauge">
      <div className="bar-gauge__value" title={tooltip}>
        {showPercentage ? `${displayValue}%` : displayValue}
      </div>
      <div className="bar-gauge__bar">
        <div className="bar-gauge__fill" style={{ width: `${barWidth}%` }} />
      </div>
    </div>
  );
};

export default BarGauge;
