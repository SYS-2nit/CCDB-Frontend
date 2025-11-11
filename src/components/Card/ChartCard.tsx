import React, { memo, useMemo } from "react";
import "./ChartCard.scss";
import WarningIcon from "@/assets/general/warning.svg";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import SettingIcon from "@/assets/general/setting.svg";
import InfoIcon from "@/assets/general/info.svg";
import DragIcon from "@/assets/general/drag.svg";
import { getChartByTitle } from "./utils/getChartByTitle";
import { useDashboardContext } from "@/state/DashboardContext";
import { renderDynamicChart } from "./utils/renderDynamicChart";
import type { GraphDataResponse } from "@/api/dashboard";

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
  onSettingClick?: () => void;
  showSettingIcon?: boolean;
  showDragIcon?: boolean;
  graphData?: GraphDataResponse | null;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  status = "normal",
  onSettingClick,
  showSettingIcon = true,
  showDragIcon = true,
  graphData: propGraphData,
}) => {
  const StatusIcon = status === "warning" ? WarningIcon : SuccessGreenIcon;
  const {
    graphsByName,
    isFetching,
    error,
    selectedInstanceId,
    mode,
  } = useDashboardContext();

  const graphData = propGraphData ?? graphsByName[title];

  let bodyContent: React.ReactNode;

  if (!selectedInstanceId) {
    bodyContent = (
      <div className="chart-placeholder">인스턴스를 선택해주세요.</div>
    );
  } else if (!graphData && isFetching) {
    bodyContent = (
      <div className="chart-placeholder">데이터를 불러오는 중입니다...</div>
    );
  } else if (!graphData && error) {
    bodyContent = <div className="chart-placeholder">{error}</div>;
  } else if (graphData) {
    const rendered = renderDynamicChart(title, graphData, mode);
    bodyContent = rendered ?? getChartByTitle(title, graphData, mode);
  } else {
    bodyContent = getChartByTitle(title, graphData, mode);
  }

  // 차트 재생성 방지
  const chartContent = useMemo(() => getChartByTitle(title), [title]);

  return (
    <div className={`chart-card ${status}`}>
      <div className="chart-card__header">
        <div className="chart-card__left">
          {showDragIcon && <img src={DragIcon} alt="Drag" />}
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
      <div className="chart-card__body">{chartContent}</div>
    </div>
  );
};

// props가 동일하면 리렌더링 방지 (불필요한 깜빡임 제거)
export default memo(
  ChartCard,
  (prev, next) =>
    prev.title === next.title &&
    prev.status === next.status &&
    prev.showDragIcon === next.showDragIcon &&
    prev.showSettingIcon === next.showSettingIcon
);
