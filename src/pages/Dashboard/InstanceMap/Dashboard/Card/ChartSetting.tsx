import React, { useState, useMemo, useEffect } from "react";
import "./ChartSetting.scss";
import SearchIcon from "@/assets/general/search.svg";
import { chartData, type TabType } from "../data/chartData";
import { getChartByTitle } from "@/components/Card/utils/getChartByTitle";
import Button from "@/components/Button/Button";
import Checkbox from "@/components/Checkbox/Checkbox";
import {
  fetchAllGraphs,
  type GraphDataResponse,
  type GraphDefinition,
} from "@/api/dashboard";
import { useDashboardContext } from "@/state/DashboardContext";

interface ChartSettingProps {
  onClose: () => void;
  onSave: (newChartTitle: string) => void;
}

type ModeType = "category" | "resource";

/** 타입별 고정 더미데이터 생성 함수 (모든 타입에 대해 0~10 범위의 더미데이터 생성) */
const generateDummyDataByType = (
  graphType: number | null
): GraphDataResponse["data"] => {
  const dataPoints: GraphDataResponse["data"] = [];

  // 타입별 고정된 패턴의 데이터 생성
  const type = graphType ?? 1;

  // x축: 5개 데이터 포인트 (01.01 ~ 01.05)
  const dates = ["01.01", "01.02", "01.03", "01.04", "01.05"];

  // y축: 0부터 10까지의 값 범위로 통일
  for (let i = 0; i < 5; i++) {
    const values: Record<string, unknown> = {};

    // 모든 그래프 타입에 대해 0~10 범위의 더미데이터 생성
    if (type === 1) {
      // Line Chart - 2개 시리즈 (0~10 범위)
      values["series1"] = 1 + i * 2; // 1, 3, 5, 7, 9
      values["series2"] = 9 - i * 1.5; // 9, 7.5, 6, 4.5, 3
    } else if (type === 2) {
      // Stack Chart - 4개 시리즈 (0~10 범위)
      values["series1"] = 1 + i * 0.5; // 1, 1.5, 2, 2.5, 3
      values["series2"] = 0.5 + i * 0.4; // 0.5, 0.9, 1.3, 1.7, 2.1
      values["series3"] = 0 + i * 0.3; // 0, 0.3, 0.6, 0.9, 1.2
      values["series4"] = 0 + i * 0.2; // 0, 0.2, 0.4, 0.6, 0.8
    } else if (type === 3) {
      // Gauge Chart - 단일 값 (0~10 범위)
      values["value"] = 5;
    } else if (type === 4) {
      // Donut Chart - 3개 값 (0~10 범위)
      values["value1"] = 4;
      values["value2"] = 3;
      values["value3"] = 2;
    } else if (type === 5) {
      // Timeline Chart - 3개 시리즈 (0~10 범위)
      values["series1"] = 2 + i * 1.5; // 2, 3.5, 5, 6.5, 8
      values["series2"] = 1 + i * 1; // 1, 2, 3, 4, 5
      values["series3"] = 0 + i * 0.5; // 0, 0.5, 1, 1.5, 2
    } else if (type === 7) {
      // Tile Chart - 4개 값 (0~10 범위)
      values["tile1"] = 7;
      values["tile2"] = 5;
      values["tile3"] = 3;
      values["tile4"] = 1;
    } else {
      // 기본값 - Line Chart 형태 (0~10 범위)
      values["value"] = 2 + i * 2; // 2, 4, 6, 8, 10
    }

    dataPoints.push({
      timestamp: dates[i],
      values,
    });
  }

  return dataPoints;
};

/** 타입별 더미데이터 캐시 */
const dummyDataCache = new Map<number, GraphDataResponse["data"]>();

/** 더미데이터 생성 함수 (타입별로 캐싱하여 같은 타입은 항상 같은 데이터 반환) */
const generateDummyData = (
  graphName: string,
  graphType: number | null
): GraphDataResponse => {
  const type = graphType ?? 1;

  // 캐시에 없으면 생성
  if (!dummyDataCache.has(type)) {
    dummyDataCache.set(type, generateDummyDataByType(type));
  }

  const cachedData = dummyDataCache.get(type)!;

  return {
    id: 0,
    name: graphName,
    description: "",
    type: type,
    data: cachedData,
  };
};

const ChartSetting: React.FC<ChartSettingProps> = ({ onClose, onSave }) => {
  // 상태 관리
  const [mode, setMode] = useState<ModeType>("category");
  const [activeTab, setActiveTab] = useState<TabType>("performance");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allGraphs, setAllGraphs] = useState<GraphDefinition[]>([]);

  const { mode: dashboardMode } = useDashboardContext();

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

  /** 선택된 그래프 */
  const selectedGraphName =
    selectedOption !== null ? currentGraphs[selectedOption] : null;

  /** 전체 그래프 목록 가져오기 */
  useEffect(() => {
    const loadAllGraphs = async () => {
      try {
        const graphs = await fetchAllGraphs();
        setAllGraphs(graphs);
      } catch (error) {
        console.error("그래프 목록 조회 실패:", error);
      }
    };
    void loadAllGraphs();
  }, []);

  /** 그래프별 더미데이터 가져오기 (항상 더미데이터 반환) */
  const getDummyDataForGraph = (graphName: string): GraphDataResponse => {
    const graphDefinition = allGraphs.find((g) => g.name === graphName);
    // 그래프 타입이 없어도 기본 타입(1: Line Chart)으로 더미데이터 생성
    const graphType = graphDefinition?.type ?? 1;
    return generateDummyData(graphName, graphType);
  };

  return (
    <aside className="chart-setting">
      {/* 헤더 */}
      <div className="chart-setting__header">
        <span className="chart-setting__header--title">차트 변경</span>
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
            currentGraphs.map((graph, i) => {
              // 더미데이터만 사용 (DB에서 데이터를 가져오지 않음)
              const dummyData = getDummyDataForGraph(graph);
              const miniChart = getChartByTitle(
                graph,
                dummyData,
                dashboardMode
              );

              return (
                <div key={graph} className="chart-setting__option-item">
                  <Checkbox
                    checked={selectedOption === i}
                    onChange={() =>
                      setSelectedOption((prev) => (prev === i ? null : i))
                    }
                    label={graph}
                    size="md"
                  />
                  <div className="chart-setting__option-item--chart">
                    {miniChart}
                  </div>
                </div>
              );
            })
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
