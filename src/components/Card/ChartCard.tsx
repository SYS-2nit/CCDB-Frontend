import React, { memo, useState } from "react";
import "./ChartCard.scss";
import WarningIcon from "@/assets/general/warning.svg";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import SettingIcon from "@/assets/general/setting.svg";
import InfoIcon from "@/assets/general/info.svg";
import DragIcon from "@/assets/general/drag.svg";
import ChartInfoModal from "./ChartInfoModal";

import { getChartByTitle } from "./utils/getChartByTitle";
import { renderDynamicChart } from "./utils/renderDynamicChart";

import {
  useDashboardContext,
  type DashboardMode,
} from "@/state/DashboardContext";
import type { GraphDataResponse } from "@/api/Dashboard/dashboard";

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
  onSettingClick?: () => void;
  showSettingIcon?: boolean;
  showDragIcon?: boolean;
  graphData?: GraphDataResponse | null;
  mode?: DashboardMode;
  description?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  status = "normal",
  onSettingClick,
  showSettingIcon = true,
  showDragIcon = true,
  graphData: propGraphData,
  mode: propMode,
  description = "그래프 설명이 설정되지 않았습니다.",
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const StatusIcon = status === "warning" ? WarningIcon : SuccessGreenIcon;

  const {
    graphsByName,
    isFetching,
    error,
    selectedInstanceId,
    mode: contextMode,
  } = useDashboardContext();

  const graphData = propGraphData ?? graphsByName[title];
  const mode = propMode ?? contextMode;

  // Body Content 결정
  let bodyContent: React.ReactNode;

  if (!propGraphData && !selectedInstanceId) {
    bodyContent = (
      <div className="chart-placeholder">인스턴스를 선택해주세요.</div>
    );
  } else if (
    (!propGraphData && !graphData && isFetching) ||
    (propGraphData === undefined && isFetching)
  ) {
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
      {/* Info 모달 — 카드 내부에서 렌더링 */}
      {showInfo && (
        <ChartInfoModal
          description={description}
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        />
      )}

      <div className="chart-card__header">
        <div className="chart-card__left">
          {showDragIcon && <img src={DragIcon} alt="Drag" />}
          <span className="chart-card__title">{title}</span>
          <img src={StatusIcon} alt={status} />
        </div>

        {/* Info hover 영역 */}
        <div className="chart-card__right">
          <img
            src={InfoIcon}
            alt="info"
            className="chart-card__info"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          />

          {/* Setting 클릭 시 Info 강제 닫기 */}
          {showSettingIcon && (
            <img
              src={SettingIcon}
              alt="setting"
              className="chart-card__setting"
              onClick={() => {
                setShowInfo(true);
                onSettingClick?.();
              }}
            />
          )}
        </div>
      </div>

      <div className="chart-card__body">{bodyContent}</div>
    </div>
  );
};

// memo 최적화
export default memo(ChartCard, (prev, next) => {
  if (
    prev.title !== next.title ||
    prev.status !== next.status ||
    prev.showDragIcon !== next.showDragIcon ||
    prev.showSettingIcon !== next.showSettingIcon ||
    prev.mode !== next.mode ||
    prev.description !== next.description
  ) {
    return false;
  }

  const prevData = prev.graphData;
  const nextData = next.graphData;

  if (!prevData && !nextData) return true;
  if (!prevData || !nextData) return false;
  if (prevData.id !== nextData.id) return false;

  const prevLength = prevData.data?.length ?? 0;
  const nextLength = nextData.data?.length ?? 0;
  if (prevLength !== nextLength) return false;

  if (prevLength > 0) {
    const prevTS = prevData.data![prevLength - 1].timestamp;
    const nextTS = nextData.data![nextLength - 1].timestamp;
    if (prevTS !== nextTS) return false;
  }

  return true;
});
