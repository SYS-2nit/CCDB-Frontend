import React, { useState, useMemo } from "react";
import "./ChartSetting.scss";
import SearchIcon from "@/assets/general/search.svg";
import {
  performanceGraphs,
  preventionGraphs,
} from "@/pages/Dashboard/data/chartConfig";

interface ChartSettingProps {
  onClose: () => void;
}

const ChartSetting: React.FC<ChartSettingProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<"performance" | "prevention">(
    "performance"
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleCheckboxChange = (index: number) => {
    setSelectedOption((prev) => (prev === index ? null : index)); // 단일 선택
  };

  // 전체 그래프 목록 + 탭 정보
  const allGraphs = [
    ...performanceGraphs.map((name) => ({
      name,
      tab: "performance" as const,
    })),
    ...preventionGraphs.map((name) => ({
      name,
      tab: "prevention" as const,
    })),
  ];

  // 검색
  const filteredGraphs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      // 검색어 없을 때는 현재 탭만 조회
      return allGraphs.filter((g) => g.tab === activeTab);
    }

    const results = allGraphs.filter((g) =>
      g.name.toLowerCase().includes(term)
    );

    // 검색 결과에 있는 데이터의 탭 활성화
    if (results.length > 0) {
      setActiveTab(results[0].tab);
    }

    return results;
  }, [searchTerm, activeTab]);

  // 현재 탭에 맞는 그래프 목록
  const currentGraphs = filteredGraphs.filter((g) => g.tab === activeTab);

  return (
    <aside className="chart-setting">
      {/* 헤더 */}
      <div className="chart-setting__header">
        <span className="chart-setting__header--title">차트 설정</span>
      </div>

      {/* 바디 */}
      <div className="chart-setting__body">
        {/* 검색 */}
        <div className="chart-setting__body--search">
          <img src={SearchIcon} alt="search" />
          <input
            type="text"
            placeholder="그래프 이름을 검색하세요."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 미리보기 */}
        <div className="chart-setting__body--preview">
          {selectedOption !== null && currentGraphs[selectedOption]
            ? `${currentGraphs[selectedOption].name}`
            : "체크박스를 클릭해 그래프를 미리 확인해보세요."}
        </div>

        {/* 탭 */}
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

        {/* 검색 결과 or 현재 탭 목록 */}
        <div className="chart-setting__body--options">
          {currentGraphs.length > 0 ? (
            currentGraphs.map((graph, i) => (
              <label
                key={graph.name}
                className={selectedOption === i ? "active" : ""}
                onClick={() => handleCheckboxChange(i)}
              >
                <input
                  type="checkbox"
                  checked={selectedOption === i}
                  readOnly
                />
                {graph.name}
              </label>
            ))
          ) : (
            <span className="chart-setting__body--no-result">
              검색 결과가 없습니다.
            </span>
          )}
        </div>
      </div>

      {/* 푸터 */}
      <div className="chart-setting__footer">
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
