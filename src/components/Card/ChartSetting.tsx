import React from "react";
import "./ChartSetting.scss";

interface ChartSettingProps {
  onClose: () => void;
}

const ChartSetting: React.FC<ChartSettingProps> = ({ onClose }) => {
  return (
    <aside className="chart-setting">
      <div className="chart-setting__header">
        <h3>차트 설정</h3>
      </div>

      <div className="chart-setting__search">
        <input type="text" placeholder="검색어를 입력해주세요." />
      </div>

      <div className="chart-setting__preview">
        체크박스를 클릭해 그래프를 미리 확인해보세요.
      </div>

      <div className="chart-setting__options">
        <h4>성능 개선</h4>
        <label>
          <input type="checkbox" /> 그래프 이름
        </label>
        <label>
          <input type="checkbox" /> 그래프 이름
        </label>
        <label>
          <input type="checkbox" /> 그래프 이름
        </label>
        <label>
          <input type="checkbox" /> 그래프 이름
        </label>
      </div>

      <div className="chart-setting__actions">
        <button className="cancel" onClick={onClose}>
          취소
        </button>
        <button className="confirm" onClick={onClose}>
          저장
        </button>
      </div>
    </aside>
  );
};

export default ChartSetting;
