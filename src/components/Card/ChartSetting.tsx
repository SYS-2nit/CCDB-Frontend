import React, { useState } from "react";
import "./ChartSetting.scss";
import SearchIcon from "@/assets/general/search.svg";
import { performanceGraphs, preventionGraphs } from "./chartConfig"; // ✅ 추가

interface ChartSettingProps {
  onClose: () => void;
}

const ChartSetting: React.FC<ChartSettingProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"performance" | "prevention">(
    "performance"
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleCheckboxChange = (index: number) => {
    setSelectedOption((prev) => (prev === index ? null : index));
  };

  // 현재 탭에 맞는 그래프 목록 선택
  const graphNames =
    activeTab === "performance" ? performanceGraphs : preventionGraphs;

  return (
    <aside className="chart-setting">
      <div className="chart-setting__header">
        <span className="chart-setting__header--title">차트 설정</span>
      </div>

      <div className="chart-setting__body">
        <div className="chart-setting__body--search">
          <img src={SearchIcon} alt="search" />
          <input type="text" placeholder="검색어를 입력해주세요." />
        </div>

        <div className="chart-setting__body--preview">
          {selectedOption !== null
            ? `${graphNames[selectedOption]}`
            : "체크박스를 클릭해 그래프를 미리 확인해보세요."}
        </div>

        <div className="chart-setting__tabs">
          <button
            className={`chart-setting__tab ${
              activeTab === "performance" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("performance");
              setSelectedOption(null);
            }}
          >
            성능 개선
          </button>
          <button
            className={`chart-setting__tab ${
              activeTab === "prevention" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("prevention");
              setSelectedOption(null);
            }}
          >
            장애 예방
          </button>
        </div>

        <div className="chart-setting__body--options">
          {graphNames.map((name, i) => (
            <label
              key={i}
              className={selectedOption === i ? "active" : ""}
              onClick={() => handleCheckboxChange(i)}
            >
              <input type="checkbox" checked={selectedOption === i} readOnly />
              {name}
            </label>
          ))}
        </div>
      </div>

      <div className="chart-setting__footer">
        <button className="cancel" onClick={onClose}>
          취소
        </button>
        <button className="confirm" onClick={onClose}>
          확인
        </button>
      </div>
    </aside>
  );
};

export default ChartSetting;
