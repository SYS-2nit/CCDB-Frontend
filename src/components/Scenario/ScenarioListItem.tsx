/*
 ******************************************************************
 작성자: 배지원
 ******************************************************************
 */
import React from "react";
import type { ScenarioId, ScenarioMeta } from "./types";
import Checkbox from "../Checkbox/Checkbox";

interface Props {
  meta: ScenarioMeta;
  checked: boolean;
  running: boolean;
  status?: { current?: ScenarioId; remain?: number; loop?: number };
  onToggle: () => void;
  onOpenDetail: () => void;
}

const ScenarioListItem: React.FC<Props> = ({
  meta,
  checked,
  running,
  status,
  onToggle,
  onOpenDetail,
}) => {
  return (
    <div className="scenario-item" onClick={onOpenDetail}>
      <div className="scenario-item__left">
        <div className="scenario-item__left-row">
          {running && <span className="scenario-item__badge">진행중</span>}
        </div>
        <div className="scenario-item__title">{meta.title}</div>
        <div className="scenario-item__left-row">
          {running && (
            <>
              <span className="scenario-item__status">
                잔여: {status?.remain}s
              </span>
              <span className="scenario-item__status">
                루프: {status?.loop ?? 0}
              </span>
            </>
          )}
        </div>
      </div>
      <div
        className="scenario-item__right"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox checked={checked} onChange={onToggle} />
      </div>
    </div>
  );
};

export default ScenarioListItem;
