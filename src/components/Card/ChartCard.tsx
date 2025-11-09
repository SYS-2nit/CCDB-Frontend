import React from "react";
import "./ChartCard.scss";
import WarningIcon from "@/assets/general/warning.svg";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import SettingIcon from "@/assets/general/setting.svg";
import InfoIcon from "@/assets/general/info.svg";
import DragIcon from "@/assets/general/drag.svg";
import { getChartByTitle } from "./utils/getChartByTitle";
import type { GraphDataResponse } from "@/api";

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
  onSettingClick?: () => void;
  showSettingIcon?: boolean;
  showDragIcon?: boolean;
  graphData?: GraphDataResponse | null;
  isLoading?: boolean;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  status = "normal",
  onSettingClick,
  showSettingIcon = true,
  showDragIcon = true,
  graphData,
  isLoading = false,
}) => {
  const StatusIcon = status === "warning" ? WarningIcon : SuccessGreenIcon;

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
      <div className="chart-card__body">
        {isLoading ? (
          <div>로딩 중...</div>
        ) : (
          getChartByTitle(title, graphData) || null
        )}
      </div>
    </div>
  );
};

export default ChartCard;
