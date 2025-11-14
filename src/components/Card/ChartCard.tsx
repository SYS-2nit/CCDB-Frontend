import React, { memo } from "react";
import "./ChartCard.scss";
import WarningIcon from "@/assets/general/warning.svg";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import SettingIcon from "@/assets/general/setting.svg";
import InfoIcon from "@/assets/general/info.svg";
import DragIcon from "@/assets/general/drag.svg";
import { getChartByTitle } from "./utils/getChartByTitle";
import { useDashboardContext, type DashboardMode } from "@/state/DashboardContext";
import { renderDynamicChart } from "./utils/renderDynamicChart";
import type { GraphDataResponse } from "@/api/dashboard";

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
  onSettingClick?: () => void;
  showSettingIcon?: boolean;
  showDragIcon?: boolean;
  graphData?: GraphDataResponse | null;
  mode?: DashboardMode; // 히스토리 페이지에서 사용
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  status = "normal",
  onSettingClick,
  showSettingIcon = true,
  showDragIcon = true,
  graphData: propGraphData,
  mode: propMode,
}) => {
  const StatusIcon = status === "warning" ? WarningIcon : SuccessGreenIcon;
  const {
    graphsByName,
    isFetching,
    error,
    selectedInstanceId,
    mode: contextMode,
  } = useDashboardContext();

  const graphData = propGraphData ?? graphsByName[title];
  const mode = propMode ?? contextMode; // propMode가 있으면 사용, 없으면 contextMode 사용

  let bodyContent: React.ReactNode;

  // propGraphData가 있으면 (히스토리 페이지 등) selectedInstanceId 체크 생략
  if (!propGraphData && !selectedInstanceId) {
    bodyContent = (
      <div className="chart-placeholder">인스턴스를 선택해주세요.</div>
    );
  } else if ((!propGraphData && !graphData && isFetching) || (propGraphData === undefined && isFetching)) {
    // propGraphData가 undefined이고 로딩 중이면 로딩 상태 표시
    bodyContent = (
      <div className="chart-placeholder">데이터를 불러오는 중입니다...</div>
    );
  } else if (!propGraphData && !graphData && error) {
    bodyContent = <div className="chart-placeholder">{error}</div>;
  } else if (graphData) {
    const rendered = renderDynamicChart(title, graphData, mode);
    bodyContent = rendered ?? getChartByTitle(title, graphData, mode);
  } else {
    bodyContent = getChartByTitle(title, graphData, mode);
  }

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
      <div className="chart-card__body">{bodyContent}</div>
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
