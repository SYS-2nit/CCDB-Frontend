import React from "react";
import "./ChartCard.scss";
import WarningIcon from "@/assets/general/warning.svg";
import SuccessIcon from "@/assets/general/success.svg";
import DragIcon from "@/assets/general/drag.svg";
import InfoIcon from "@/assets/general/info.svg";
import SettingIcon from "@/assets/general/setting.svg";

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
}

const ChartCard: React.FC<ChartCardProps> = ({ title, status = "normal" }) => {
  // 상태에 따른 아이콘 선택
  const StatusIcon = status === "warning" ? WarningIcon : SuccessIcon;

  return (
    <div className={`chart-card ${status}`}>
      <div className="chart-card__header">
        <div className="chart-card__left">
          <img src={DragIcon} alt="drag" />
          <span className="chart-card__title">{title}</span>
          <img
            src={StatusIcon}
            alt={status === "warning" ? "warning" : "success"}
          />
        </div>
        <div className="chart-card__right">
          <img src={InfoIcon} alt="info" />
          <img src={SettingIcon} alt="setting" />
        </div>
      </div>
      <div className="chart-card__body">
        <div className="chart-placeholder">차트를 불러올 수 없습니다.</div>
      </div>
    </div>
  );
};

export default ChartCard;
