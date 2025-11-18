import React from "react";
import "./ChartInfoModal.scss";

interface Props {
  description: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ChartInfoModal: React.FC<Props> = ({
  description,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className="chart-info-modal"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {description}
    </div>
  );
};

export default ChartInfoModal;
