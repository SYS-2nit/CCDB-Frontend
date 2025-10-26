import React from "react";
import "./MetricCard.scss";

export interface MetricData {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

interface MetricGridProps {
  metrics: MetricData[];
  columns?: number;
}

const MetricCard: React.FC<MetricData> = ({
  title,
  value,
  subtitle = "window: last 60s",
  color = "#1E1E1E",
}) => {
  return (
    <div className="metric-card">
      <span className="metric-card__title">{title}</span>
      <span className="metric-card__value" style={{ color }}>
        {value}
      </span>
      <span className="metric-card__subtitle">{subtitle}</span>
    </div>
  );
};

const MetricGrid: React.FC<MetricGridProps> = ({ metrics, columns = 4 }) => {
  return (
    <div
      className="metric-grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default MetricGrid;
