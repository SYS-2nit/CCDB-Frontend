import React from "react";
import "./BarGauge.scss";

interface BarGaugeProps {
  value: number;
  max?: number;
  color?: string;
}

const BarGauge: React.FC<BarGaugeProps> = ({
  value,
  max = 100,
  color = "#3B82F6",
}) => {
  const percent = Math.min(100, (value / max) * 100);

  return (
    <div className="bar-gauge">
      <div className="bar-gauge__value">{value}</div>
      <div className="bar-gauge__bar">
        <div
          className="bar-gauge__fill"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

export default BarGauge;
