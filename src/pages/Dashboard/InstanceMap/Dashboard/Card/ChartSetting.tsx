import React, { useState, useMemo, useRef, useEffect } from "react";
import "./ChartSetting.scss";
import SearchIcon from "@/assets/general/search.svg";
import { chartData, type TabType } from "../data/chartData";
import { getChartByTitle } from "@/components/Card/utils/getChartByTitle";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";

interface ChartSettingProps {
  onClose: () => void;
  onSave: (newChartTitle: string) => void;
}

type ModeType = "category" | "resource";

const ChartSetting: React.FC<ChartSettingProps> = ({ onClose, onSave }) => {
  // 상태 관리
  const [mode, setMode] = useState<ModeType>("category");
  const [activeTab, setActiveTab] = useState<TabType>("performance");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const previewRef = useRef<HTMLDivElement | null>(null);

  /** 탭 목록 정의 */
  const categoryTabs = [
    { id: "performance", label: "성능 개선" },
    { id: "prevention", label: "장애 예방" },
  ] as const;

  const resourceTabs = [
    { id: "cpu", label: "CPU" },
    { id: "memory", label: "Memory" },
    { id: "session", label: "Session" },
    { id: "io", label: "I/O" },
    { id: "storage", label: "Storage" },
  ] as const;

  const tabs = mode === "category" ? categoryTabs : resourceTabs;

  /** 모드 전환 */
  const toggleMode = () => {
    setMode((prev) => (prev === "category" ? "resource" : "category"));
    setActiveTab((prev) => (prev === "performance" ? "cpu" : "performance"));
    setSelectedOption(null);
    setSearchTerm("");
  };

  /** 검색 결과 */
  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return null;

    const searchTargets =
      mode === "category"
        ? ["performance", "prevention"]
        : ["cpu", "memory", "session", "io", "storage"];

    const results: { tab: TabType; name: string }[] = [];

    searchTargets.forEach((tab) => {
      const charts = chartData[tab as TabType] || [];
      charts.forEach((name) => {
        if (name.toLowerCase().includes(term))
          results.push({ tab: tab as TabType, name });
      });
    });

    // 검색 결과 첫 번째 탭으로 이동
    if (results.length > 0 && activeTab !== results[0].tab) {
      setActiveTab(results[0].tab);
    }

    return results;
  }, [searchTerm, mode]);

  /** 현재 탭의 그래프 목록 */
  const currentGraphs = useMemo(() => {
    if (searchResults) {
      return searchResults
        .filter((r) => r.tab === activeTab)
        .map((r) => r.name);
    }
    return chartData[activeTab] ?? [];
  }, [activeTab, searchResults]);

  /** 선택된 그래프 → 미리보기 */
  const selectedGraphName =
    selectedOption !== null ? currentGraphs[selectedOption] : null;

  const selectedChart = selectedGraphName
    ? getChartByTitle(selectedGraphName)
    : null;

  /** 미리보기 크기 보정 */
  useEffect(() => {
    if (!previewRef.current) return;
    window.dispatchEvent(new Event("resize"));
  }, [selectedChart]);

  return (
    <aside className="chart-setting">
      {/* 헤더 */}
      <div className="chart-setting__header">
        <span className="chart-setting__header--title">차트 설정</span>
      </div>

      {/* 본문 */}
      <div className="chart-setting__body">
        {/* 검색창 */}
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
        <div className="chart-setting__body--preview" ref={previewRef}>
          {selectedChart ? (
            <div className="chart-preview-container">{selectedChart}</div>
          ) : (
            <span>체크박스를 클릭해 그래프를 미리 확인해보세요.</span>
          )}
        </div>

        {/* 탭 영역 */}
        <div className="chart-setting__tabs">
          <div className="chart-setting__tab-group">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                className={`chart-setting__tab ${
                  activeTab === id ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(id as TabType);
                  setSelectedOption(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button className="chart-setting__switch-btn" onClick={toggleMode}>
            {mode === "category" ? "자원별" : "기본"}
          </button>
        </div>

        {/* 체크박스 목록 */}
        <div className="chart-setting__body--options">
          {currentGraphs.length > 0 ? (
            currentGraphs.map((graph, i) => (
              <Checkbox
                key={graph}
                checked={selectedOption === i}
                onChange={() =>
                  setSelectedOption((prev) => (prev === i ? null : i))
                }
                label={graph}
                size="md"
              />
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
        <Button text="취소" size="sm" variant="white" onClick={onClose} />
        <Button
          text="저장"
          size="sm"
          variant="primary"
          onClick={() => {
            if (selectedGraphName) onSave(selectedGraphName);
          }}
        />
      </div>
    </aside>
  );
};

export default ChartSetting;
