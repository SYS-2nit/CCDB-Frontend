import React from "react";
import "./DBStatusCard.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

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
    <div className="database-status-card">
      <span className="database-status-card__title">{title}</span>
      <div className="database-status-card__right">
        <span className="database-status-card__value">{value}</span>
        {subValue && (
          <span className={`database-status-card__sub ${trendClass}`}>
            {trendSymbol} {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default DBStatusCard;
