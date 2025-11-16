import React from "react";
import "./PlanCompareView.scss";
import DiffViewer, { DiffMethod } from "react-diff-viewer-continued";

interface Props {
  beforeHash: number | null;
  afterHash: number | null;
  beforePlanText: string | null;
  afterPlanText: string | null;
}

const PlanCompareView: React.FC<Props> = ({
  beforeHash,
  afterHash,
  beforePlanText,
  afterPlanText,
}) => {
  // null 처리
  const noChange =
    beforePlanText === null ||
    afterPlanText === null ||
    beforePlanText.trim() === afterPlanText.trim();

  if (noChange) {
    return (
      <div className="plan-compare-empty">
        <div className="empty-box">
          <p>이번 실행에서는 Plan 변경이 없습니다.</p>
          <div className="empty-box-hash">
            <p className="sub">BEFORE - {beforeHash}</p>
            <p className="sub">/</p>
            <p className="sub">AFTER - {afterHash}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-compare-container">
      <div className="plan-compare-header">
        <div className="title">Before ({beforeHash})</div>
        <div className="title">After ({afterHash})</div>
      </div>

      <DiffViewer
        oldValue={beforePlanText ?? ""}
        newValue={afterPlanText ?? ""}
        splitView={true}
        useDarkTheme={false}
        compareMethod={DiffMethod.WORDS}
      />
    </div>
  );
};

export default PlanCompareView;
