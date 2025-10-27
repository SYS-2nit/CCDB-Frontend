import React from "react";
import "./DBStatusCard.scss";

interface StatusCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "none";
  subValue?: string | number;
}

const DBStatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  trend = "none",
  subValue,
}) => {
  const trendClass =
    trend === "up" ? "trend-up" : trend === "down" ? "trend-down" : "";

  const trendSymbol = trend === "up" ? "↑" : trend === "down" ? "↓" : "";

  return (
    <div className="status-card">
      <span className="status-card__title">{title}</span>
      <div className="status-card__right">
        <span className="status-card__value">{value}</span>
        {subValue && (
          <span className={`status-card__sub ${trendClass}`}>
            {trendSymbol} {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default DBStatusCard;
