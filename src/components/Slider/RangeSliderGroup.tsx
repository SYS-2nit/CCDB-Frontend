import React from "react";
import "./RangeSliderGroup.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

export interface RangeLevels {
  warningMin: number;
  warningMax: number;
  dangerMin: number;
  dangerMax: number;
  criticalMin: number;
  criticalMax: number;
}

interface RangeSliderGroupProps {
  levels: RangeLevels;
  onChange: (key: keyof RangeLevels, value: number) => void;
}

const RangeSliderGroup: React.FC<RangeSliderGroupProps> = ({
  levels,
  onChange,
}) => {
  const groups = [
    { label: "주의", key: "warning", color: "#2952E1" },
    { label: "위험", key: "danger", color: "#2952E1" },
    { label: "치명", key: "critical", color: "#2952E1" },
  ] as const;

  return (
    <div className="range-slider-group">
      {groups.map(({ label, key, color }) => {
        const minKey = `${key}Min` as keyof RangeLevels;
        const maxKey = `${key}Max` as keyof RangeLevels;
        const minVal = levels[minKey];
        const maxVal = levels[maxKey];

        return (
          <div key={key} className="range-slider">
            <label>{label}</label>
            <div
              className="dual-slider-wrapper"
              style={
                {
                  "--min": minVal,
                  "--max": maxVal,
                  "--color": color,
                } as React.CSSProperties
              }
            >
              {/* Min thumb */}
              <input
                type="range"
                min={0}
                max={100}
                value={minVal}
                onChange={(e) =>
                  onChange(minKey, Math.min(Number(e.target.value), maxVal - 1))
                }
              />
              {/* Max thumb */}
              <input
                type="range"
                min={0}
                max={100}
                value={maxVal}
                onChange={(e) =>
                  onChange(maxKey, Math.max(Number(e.target.value), minVal + 1))
                }
              />

              {/* 현재 값 표시 */}
              <div className="value-labels">
                <span
                  className="value-label min-label"
                  style={{ left: `${minVal}%` }}
                >
                  {minVal}
                </span>
                <span
                  className="value-label max-label"
                  style={{ left: `${maxVal}%` }}
                >
                  {maxVal}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RangeSliderGroup;
