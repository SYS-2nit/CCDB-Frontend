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

  // modal visible state
  const [showInfo, setShowInfo] = useState(false);

  const data = graphData ?? graphsByName[title];
  const mode = propMode ?? contextMode;

  // modal 위치 고정 (모든 카드 동일 좌표)
  const modalPos = { x: 0, y: 0 };

  // Info hover handlers
  const handleInfoEnter = () => {
    setShowInfoModal(true);
  };

  const handleInfoLeave = () => {
    setShowInfoModal(false);
  };

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
          {/* Info hover */}
          <div
            onMouseEnter={handleInfoEnter}
            onMouseLeave={handleInfoLeave}
            style={{ position: "relative" }}
          >
            <img src={InfoIcon} alt="info" />
            {showInfoModal && graphData?.description && (
              <ChartInfoModal
                pos={{ x: -300, y: 0 }}
                description={graphData.description}
                onMouseEnter={() => setShowInfoModal(true)}
                onMouseLeave={() => setShowInfoModal(false)}
              />
            )}
            {/* Setting click */}
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

      {/* INFO 모달 */}
      {showInfo && data?.description && (
        <ChartInfoModal
          pos={modalPos}
          description={data.description}
          onMouseEnter={() => setShowInfo(false)}
          onMouseLeave={() => setShowInfo(true)}
        />
      )}
    </div>
  );
};

export default memo(ChartCard);
