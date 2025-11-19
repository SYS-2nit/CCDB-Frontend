import React, { useState, memo } from "react";
import "./ChartCard.scss";
import WarningIcon from "@/assets/general/warning.svg";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import SettingIcon from "@/assets/general/setting.svg";
import InfoIcon from "@/assets/general/info.svg";
import DragIcon from "@/assets/general/drag.svg";
import { getChartByTitle } from "./utils/getChartByTitle";
import {
  useDashboardContext,
  type DashboardMode,
} from "@/state/DashboardContext";
import { renderDynamicChart } from "./utils/renderDynamicChart";
import ChartInfoModal from "./ChartInfoModal";
import type { GraphDataResponse } from "@/api/Dashboard/dashboard";

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
  onSettingClick?: () => void;
  showSettingIcon?: boolean;
  showDragIcon?: boolean;
  graphData?: GraphDataResponse | null;
  mode?: DashboardMode;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  status = "normal",
  onSettingClick,
  showSettingIcon = true,
  showDragIcon = true,
  graphData,
  mode: propMode,
}) => {
  const StatusIcon = status === "warning" ? WarningIcon : SuccessGreenIcon;
  const [showInfoModal, setShowInfoModal] = useState(false);

  const {
    graphsByName,
    isFetching,
    error,
    selectedInstanceId,
    mode: contextMode,
  } = useDashboardContext();

  const [showInfo, setShowInfo] = useState(false);

  const data = graphData ?? graphsByName[title];
  const mode = propMode ?? contextMode;

  // 모달 고정 위치
  const modalPos = { x: -300, y: 0 };

  const handleInfoEnter = () => {
    setShowInfoModal(true);
  };

  const handleInfoLeave = () => {
    setShowInfoModal(false);
  };

  // Description 가공
  const formattedDescription =
    graphData?.description?.split("\n").join("<br />") ?? "";

  let bodyContent: React.ReactNode;

  if (!graphData && !selectedInstanceId) {
    bodyContent = (
      <div className="chart-placeholder">인스턴스를 선택해주세요.</div>
    );
  } else if (!graphData && isFetching) {
    bodyContent = (
      <div className="chart-placeholder">데이터를 불러오는 중입니다...</div>
    );
  } else if (!graphData && error) {
    bodyContent = <div className="chart-placeholder">{error}</div>;
  } else if (data) {
    const rendered = renderDynamicChart(title, data, mode);
    bodyContent = rendered ?? getChartByTitle(title, data, mode);
  } else {
    bodyContent = getChartByTitle(title, data, mode);
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
          <div
            onMouseEnter={handleInfoEnter}
            onMouseLeave={handleInfoLeave}
            style={{ position: "relative" }}
          >
            <img src={InfoIcon} alt="info" />

            {showInfoModal && graphData?.description && (
              <ChartInfoModal
                pos={modalPos}
                description={formattedDescription}
                onMouseEnter={() => setShowInfoModal(true)}
                onMouseLeave={() => setShowInfoModal(false)}
              />
            )}

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
      </div>

      <div className="chart-card__body">{bodyContent}</div>

      {/* Info Modal for click */}
      {showInfo && data?.description && (
        <ChartInfoModal
          pos={modalPos}
          description={formattedDescription}
          onMouseEnter={() => setShowInfo(false)}
          onMouseLeave={() => setShowInfo(true)}
        />
      )}
    </div>
  );
};

export default memo(ChartCard);
