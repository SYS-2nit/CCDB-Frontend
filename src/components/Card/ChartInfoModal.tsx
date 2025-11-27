import React from "react";
import "./ChartInfoModal.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

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
      dangerouslySetInnerHTML={{ __html: description ?? "" }}
    />
  );
};

export default ChartInfoModal;
