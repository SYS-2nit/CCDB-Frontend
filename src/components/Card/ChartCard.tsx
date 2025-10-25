import React from "react";
import "./ChartCard.scss";
import WarningIcon from "@/assets/general/warning.svg";
import SuccessIcon from "@/assets/general/success.svg";
import SettingIcon from "@/assets/general/setting.svg";
import InfoIcon from "@/assets/general/info.svg";

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
  onSettingClick?: () => void;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  status = "normal",
  onSettingClick,
}) => {
  const StatusIcon = status === "warning" ? WarningIcon : SuccessIcon;

  return (
    <div className={`chart-card ${status}`}>
      <div className="chart-card__header">
        <div className="chart-card__left">
          <span className="chart-card__title">{title}</span>
          <img src={StatusIcon} alt={status} />
        </div>
        <div className="chart-card__right">
          <img src={InfoIcon} alt="info" />
          <img
            src={SettingIcon}
            alt="setting"
            className="chart-card__setting"
            onClick={onSettingClick}
          />
        </div>
      </div>
      <div className="chart-card__body">
        <div className="chart-placeholder">차트를 불러올 수 없습니다.</div>
      </div>
    </div>
  );
};

export default ChartCard;
