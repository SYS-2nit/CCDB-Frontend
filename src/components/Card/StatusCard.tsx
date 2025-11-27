import React, { memo } from "react";
import "./StatusCard.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface StatusCardProps {
  label: string;
  value: number | string;
  color?: "safe" | "warning" | "danger" | "critical";
  change?: number; // 어제 대비 증감
}

// 불필요한 리렌더링 방지
const StatusCard: React.FC<StatusCardProps> = memo(
  ({ label, value, color = "safe", change }) => {
    // 증감 표시 (0이 아니고 undefined가 아닐 때만 표시)
    const showChange = change !== undefined && change !== 0;
    const changeText = showChange 
      ? `${change! > 0 ? "↑" : "↓"} ${Math.abs(change!)}`
      : null;

    return (
      <div className={`status-card status-card--${color}`}>
        <div className="status-card__label">{label}</div>
        <div className="status-card__value-wrapper">
          <div className="status-card__value">
            {value}
            {showChange && (
              <span className={`status-card__change status-card__change--${change! > 0 ? "up" : "down"}`}>
                ({changeText})
              </span>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.label === next.label &&
    prev.value === next.value &&
    prev.color === next.color &&
    prev.change === next.change
);

export default StatusCard;
