import React from "react";
import type { ScenarioId } from "./types";
import Button from "../Button/Button";
import Select from "../Select/Select";

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

const ScenarioControls: React.FC<Props> = ({
  durations,
  value,
  onChange,
  running,
  onStart,
  onStop,
  status,
  busy,
}) => {
  const options = durations.map((d) => ({
    value: String(d),
    label: `${Math.floor(d / 60)}분${d % 60 === 0 ? "" : ` ${d % 60}초`}`,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="scenario-controls">
      <div className="scenario-controls__left">
        {/* 주기 선택 */}
        <Select
          label="주기 설정"
          value={String(value)}
          onChange={handleChange}
          disabled={busy || running}
          options={options}
          size="sm"
        />

        {/* 진단 시작 후 메시지 */}
        {running && (
          <div className="scenario-controls__status">
            <span>진행중: {status.current}</span>
            <span>잔여: {status.remain}s</span>
            <span>루프: {status.loop ?? 0}</span>
          </div>
        )}
      </div>
      <div className="scenario-controls__right">
        {!running ? (
          <Button
            text={busy ? "" : "시작"}
            size="sm"
            variant="primary"
            onClick={onStart}
            disabled={busy}
          />
        ) : (
          <Button
            text={busy ? "" : "중지"}
            size="sm"
            variant="error"
            onClick={onStop}
            disabled={busy}
          />
        )}

        {busy && <span className="spinner" />}
      </div>
    </div>
  );
};

export default ScenarioControls;
