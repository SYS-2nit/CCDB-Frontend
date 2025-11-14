import React from "react";
import "./MetricCard.scss";

export interface MetricData {
  title: string;
  value?: string | number;
  icon?: string;
  subtitle?: string;
  color?: string;
}

interface MetricGridProps {
  metrics: MetricData[];
  columns?: number;
  height?: number | string;
}

const MetricCard: React.FC<MetricData> = ({
  title,
  value,
  icon,
  subtitle,
  color,
}) => {
  return (
    <div className="metric-card">
      <span className="metric-card__title">{title}</span>
      {icon ? (
        <img src={icon} alt={`${title}-icon`} className="metric-card__icon" />
      ) : (
        <span className="metric-card__value" style={{ color }}>
          {value}
        </span>
      )}
      {subtitle && <span className="metric-card__subtitle">{subtitle}</span>}
    </div>
  );
};

const MetricGrid: React.FC<MetricGridProps> = ({
  metrics,
  columns = 4,
  height = 0,
}) => {
  return (
    <div
      className="metric-grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        height: typeof height === "number" ? `${height}px` : height,
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          subtitle={metric.subtitle}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default MetricGrid;
