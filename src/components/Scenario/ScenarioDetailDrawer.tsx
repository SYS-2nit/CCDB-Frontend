import React from 'react';
import type { ScenarioMeta } from './types';

const ScenarioDetailDrawer: React.FC<{ meta: ScenarioMeta | null; onClose: () => void }> = ({ meta, onClose }) => {
  if (!meta) return null;
  return (
    <div className="scenario-detail__backdrop" onClick={onClose}>
      <div className="scenario-detail" onClick={(e) => e.stopPropagation()}>
        <div className="scenario-detail__header">
          <h3>{meta.title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="scenario-detail__section">
          <h4>개요</h4>
          <p>{meta.summary}</p>
        </div>
        <div className="scenario-detail__section">
          <h4>영향 탭</h4>
          <ul>{meta.affectedDashboards.map((d) => <li key={d}>{d}</li>)}</ul>
        </div>
        <div className="scenario-detail__section">
          <h4>재현 방법</h4>
          <pre>{meta.reproduction}</pre>
        </div>
      </div>
    </div>
  );
};
export default ScenarioDetailDrawer;