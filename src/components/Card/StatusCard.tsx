import React from "react";
import "./StatusCard.scss";

interface StatusCardProps {
  label: string;
  value: number | string;
  color?: "safe" | "warning" | "danger" | "critical";
}

const StatusCard: React.FC<StatusCardProps> = ({ label, value, color }) => {
  return (
    <div className={`status-card status-card--${color}`}>
      <div className="status-card__label">{label}</div>
      <div className="status-card__value">{value}</div>
    </div>
  );
};

export default StatusCard;
