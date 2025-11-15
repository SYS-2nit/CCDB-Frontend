import React from "react";
import "./CompareSqlDetailDrawer.scss";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";
import SqlDetailDrawer from "./SqlDetailDrawer";

interface CompareDetail {
  date: string;
  detail: SqlDetailData;
}

interface Props {
  base: CompareDetail | null;
  compare: CompareDetail | null;
  onClose: () => void;
}

const CompareSqlDetailDrawer: React.FC<Props> = ({
  base,
  compare,
  onClose,
}) => {
  if (!base || !compare) return null;

  return (
    <div className="compare-detail-panels">
      <div className="compare-detail-panel">
        <h3>기준 ({base.date})</h3>
        <SqlDetailDrawer data={base.detail} onClose={() => {}} />
      </div>

      <div className="compare-detail-panel">
        <h3>비교 ({compare.date})</h3>
        <SqlDetailDrawer data={compare.detail} onClose={() => {}} />
      </div>

      <button className="close-btn" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default CompareSqlDetailDrawer;
