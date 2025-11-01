import React from 'react';
import type { ScenarioId } from './types';

interface Props {
  durations: number[];
  value: number;
  onChange: (v: number) => void;
  running: boolean;
  onStart: () => void;
  onStop: () => void;
  status: { current?: ScenarioId; remain?: number; loop?: number };
  busy?: boolean;
}

const ScenarioControls: React.FC<Props> = ({ durations, value, onChange, running, onStart, onStop, status, busy }) => {
  return (
    <div className="scenario-controls">
      <div className="scenario-controls__left">
        <span>주기 설정:</span>
        <select value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={busy || running}>
          {durations.map((d) => (
            <option key={d} value={d}>
              {Math.floor(d / 60)}분 {d % 60 === 0 ? '' : `${d % 60}초`}
            </option>
          ))}
        </select>
        {running && (
          <div className="scenario-controls__status">
            <span>진행중: {status.current}</span>
            <span>잔여: {status.remain ?? '-'}s</span>
            <span>루프: {status.loop ?? 0}</span>
          </div>
        )}
      </div>
      <div className="scenario-controls__right">
        {!running ? (
          <button className="btn-primary" onClick={onStart} disabled={busy}>
            {busy ? <span className="spinner" /> : '진단'}
          </button>
        ) : (
          <button className="btn-danger" onClick={onStop} disabled={busy}>
            {busy ? <span className="spinner" /> : '멈추기'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ScenarioControls;