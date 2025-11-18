import React from "react";
import "./ChartInfoModal.scss";

interface Props {
  pos: { x: number; y: number };
  description: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ChartInfoModal: React.FC<Props> = ({
  pos,
  description,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className="chart-info-modal"
      style={{ left: pos.x, top: pos.y }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {description}
    </div>
  );
};

export default ChartInfoModal;
