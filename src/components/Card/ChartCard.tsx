import React from "react";
import "./ChartCard.scss";
import WarningIcon from "@/assets/general/warning.svg";
import SuccessIcon from "@/assets/general/success.svg";
import SettingIcon from "@/assets/general/setting.svg";
import InfoIcon from "@/assets/general/info.svg";
import DragIcon from "@/assets/general/drag.svg";
import GaugeChart from "../Chart/GaugeChart";
import LineChart from "../Chart/LineChart";
import StackChart from "../Chart/StackChart";
import MetricCard from "./MetricCard";

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
  onSettingClick?: () => void;
  showSettingIcon?: boolean;
  showDragIcon?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  status = "normal",
  onSettingClick,
  showSettingIcon = true,
  showDragIcon = true,
}) => {
  const StatusIcon = status === "warning" ? WarningIcon : SuccessIcon;

  // PGA / SGA 압박률 Metric 데이터
  const pgaMetrics = [
    { title: "Spill Rate %", value: 23 },
    { title: "Spill MB/min", value: 310 },
    { title: "Hard Parses/s", value: 34 },
    { title: "Library Cache Reloads/s", value: 12 },
  ];

  // 그래프 이름에 따른 차트 자동 선택
  const renderChart = () => {
    if (title.includes("PGA / SGA 압박률"))
      return <MetricCard metrics={pgaMetrics} columns={2} />;
    if (title.includes("Wait")) return <LineChart seriesCount={8} />;
    if (title.includes("Session 한도 상태")) return <GaugeChart />;
    if (title.includes("핵심 테이블스페이스 여유율")) return <StackChart />;
    if (title.includes("백그라운드 프로세스 상태"))
      return <LineChart seriesCount={6} />;
    if (title.includes("제한 근접 파라미터 상태"))
      return <LineChart seriesCount={3} />;
    if (title.includes("CPU 상태")) return <LineChart seriesCount={2} />;
    if (title.includes("I/O 지연량")) return <LineChart seriesCount={3} />;
    if (title.includes("I/O 처리량")) return <LineChart seriesCount={2} />;
    return <LineChart />; // 기본값
  };

  return (
    <div className={`chart-card ${status}`}>
      <div className="chart-card__header">
        <div className="chart-card__left">
          {showDragIcon && <img src={DragIcon} alt="DragIcon" />}
          <span className="chart-card__title">{title}</span>
          <img src={StatusIcon} alt={status} />
        </div>
        <div className="chart-card__right">
          <img src={InfoIcon} alt="info" />
          {showSettingIcon && (
            <img
              src={SettingIcon}
              alt="setting"
              className="chart-card__setting"
              onClick={onSettingClick}
            />
          )}
        </div>
      </div>

      <div className="chart-card__body">{renderChart()}</div>
    </div>
  );
};

export default ChartCard;
