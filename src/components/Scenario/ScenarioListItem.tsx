import React from 'react';
import type { ScenarioMeta } from './types';

interface Props {
  meta: ScenarioMeta;
  checked: boolean;
  running: boolean;
  onToggle: () => void;
  onOpenDetail: () => void;
}

const ScenarioListItem: React.FC<Props> = ({ meta, checked, running, onToggle, onOpenDetail }) => {
  return (
    <div className="scenario-item" onClick={onOpenDetail}>
      <div className="scenario-item__left">
        <button className="scenario-item__pill" type="button">
          진단
        </button>
        <div className="scenario-item__title">{meta.title}</div>
        {running && <span className="scenario-item__badge">진행중</span>}
      </div>
      <div className="scenario-item__right" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={checked} onChange={onToggle} />
      </div>
    </div>
  );
};

export default ScenarioListItem;