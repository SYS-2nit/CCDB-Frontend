import React from "react";
import type { ScenarioMeta } from "./types";

const ScenarioDetailDrawer: React.FC<{
  meta: ScenarioMeta | null;
  onClose: () => void;
}> = ({ meta, onClose }) => {
  if (!meta) return null;
  return (
    <div className="scenario-detail__backdrop" onClick={onClose}>
      <div className="scenario-detail" onClick={(e) => e.stopPropagation()}>
        <div className="scenario-detail__header">
          <h3>{meta.title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="scenario-detail__section">
          <div className="scenario-detail__title">개요</div>
          <div className="scenario-detail__content">{meta.summary}</div>
        </div>
        <div className="scenario-detail__section">
          <div className="scenario-detail__title">영향 탭</div>
          <ul>
            {meta.affectedDashboards.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="scenario-detail__section">
          <div className="scenario-detail__title">재현 방법</div>
          <pre>{meta.reproduction}</pre>
        </div>
      </div>
    </div>
  );
};
export default ScenarioDetailDrawer;
