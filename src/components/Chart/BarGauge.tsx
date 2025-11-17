import React from "react";
import "./BarGauge.scss";

interface BarGaugeProps {
  value: number; // 0~100
  max?: number;
}

const BarGauge: React.FC<BarGaugeProps> = ({ value }) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="bar-gauge">
      <div className="bar-gauge__value">{clamped.toFixed(1)}%</div>
      <div className="bar-gauge__bar">
        <div className="bar-gauge__fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
};

export default BarGauge;
