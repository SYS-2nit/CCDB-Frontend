/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react";
import "./PlanCompareView.scss";
import { createTwoFilesPatch } from "diff";
// @ts-ignore
import * as Diff2Html from "diff2html/lib/ui/js/diff2html-ui";
import "diff2html/bundles/css/diff2html.min.css";

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

  const diffString = createTwoFilesPatch(
    `Before (${beforeHash})`,
    `After (${afterHash})`,
    beforePlanText ?? "",
    afterPlanText ?? ""
  );

  const diffHtml = (Diff2Html as any).html(diffString, {
    inputFormat: "diff",
    showFiles: false,
    outputFormat: "side-by-side",
    matching: "words",
  });

  return (
    <div className="plan-compare-container">
      <div className="plan-compare-header">
        <div className="title">Before ({beforeHash})</div>
        <div className="title">After ({afterHash})</div>
      </div>

      <div
        className="diff-wrapper"
        dangerouslySetInnerHTML={{ __html: diffHtml }}
      />
    </div>
  );
};

export default PlanCompareView;
