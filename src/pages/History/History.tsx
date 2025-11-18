/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import "./History.scss";
import DateInput from "@/components/Input/DateInput";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import { X } from "lucide-react";
import Select from "@/components/Select/Select";
import {
  fetchHistoryData,
  fetchHistoryGraphList,
  type HistoryGraphDataResponse,
  type HistoryGraphInfo,
} from "@/api/History/history";
import { useDashboardContext } from "@/state/DashboardContext";
import ChartCard from "@/components/Card/ChartCard";
import Spinner from "@/components/Spinner/Spinner";
import TabMenu from "@/components/Tabs/TabMenu";
import { chartData } from "@/pages/Dashboard/InstanceMap/Dashboard/data/chartData";

interface FilterItem {
  key: string;
  label: string;
  value: string;
}

// 시간 단위 매핑
const TIME_UNIT_MAP: Record<string, "1m" | "10m" | "1h" | "1d"> = {
  "1분": "1m",
  "10분": "10m",
  "1시간": "1h",
  하루: "1d",
};

const History: React.FC = () => {
  // filters
  const { selectedInstanceId } = useDashboardContext();
  const [filters, setFilters] = useState<FilterItem[]>([]);
  const [graphList, setGraphList] = useState<HistoryGraphInfo[]>([]);
  const [historyGraphs, setHistoryGraphs] = useState<
    HistoryGraphDataResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [graphTimeUnits, setGraphTimeUnits] = useState<
    Map<number, "1m" | "10m" | "1h" | "1d">
  >(new Map());

  // 탭 옵션
  const TAB_ITEMS = [
    { id: "CUSTOM", label: "Custom" },
    { id: "CPU", label: "CPU" },
    { id: "MEMORY", label: "Memory" },
    { id: "SESSION", label: "Session" },
    { id: "IO", label: "I/O" },
    { id: "STORAGE", label: "Storage" },
  ] as const;

  // 내부 activeTab = 소문자로 관리 (chartData key와 동일)
  const [activeTab, setActiveTab] = useState<
    "cpu" | "memory" | "session" | "io" | "storage"
  >("cpu"); // 기본 CPU

  // chartData 기반 필터링
  const filteredGraphs = historyGraphs.filter((graph) =>
    chartData[activeTab]?.includes(graph.name)
  );

  /** 공통 필터 업데이트 */
  const updateFilter = useCallback(
    (key: string, label: string, value: string) => {
      setFilters((prev) => {
        if (!value || value === "0" || value === "") {
          return prev.filter((f) => f.key !== key);
        }
        const exists = prev.find((f) => f.key === key);
        if (exists) {
          return prev.map((f) => (f.key === key ? { ...f, value } : f));
        }
        return [...prev, { key, label, value }];
      });
    },
    []
  );

  /** 카테고리 변경 시 그래프 목록 조회 */
  useEffect(() => {
    const category = filters.find((f) => f.key === "category")?.value;
    if (!category) {
      setGraphList([]);
      return;
    }

    const loadGraphList = async () => {
      try {
        const response = await fetchHistoryGraphList({ category });
        setGraphList(response.graphs || []);
      } catch (error) {
        console.error("그래프 목록 조회 실패:", error);
        setGraphList([]);
      }
    };

    void loadGraphList();
  }, [filters]);

  /** 검색 */
  const handleSearch = useCallback(async () => {
    if (!selectedInstanceId) {
      alert("인스턴스를 선택해주세요.");
      return;
    }

    const startDate = filters.find((f) => f.key === "start")?.value;
    const endDate = filters.find((f) => f.key === "end")?.value;
    const category = filters.find((f) => f.key === "category")?.value;
    const graphId = filters.find((f) => f.key === "graph")?.value;
    const keyword = filters.find((f) => f.key === "keyword")?.value;
    const duration = filters.find((f) => f.key === "duration")?.value;

    if (!startDate && !endDate) {
      alert("시작일 또는 종료일을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let startDateTime: string | undefined;
      let endDateTime: string | undefined;

      if (startDate) {
        startDateTime = startDate.includes("T")
          ? startDate + ":00"
          : startDate + "T00:00:00";
      }

      if (endDate) {
        endDateTime = endDate.includes("T")
          ? endDate + ":00"
          : endDate + "T23:59:59";
      }

      const timeUnit = duration ? TIME_UNIT_MAP[duration] || "1d" : "1d";

      const response = await fetchHistoryData({
        instanceId: selectedInstanceId,
        startDateTime,
        endDateTime,
        category: category as any,
        graphId: graphId ? Number(graphId) : undefined,
        keyword: keyword || undefined,
        timeUnit,
      });

      setHistoryGraphs(response.graphs || []);

      // 그래프 시간 단위 저장
      const newUnits = new Map<number, "1m" | "10m" | "1h" | "1d">();
      response.graphs?.forEach((g) => newUnits.set(g.id, timeUnit));
      setGraphTimeUnits(newUnits);
    } catch (error) {
      console.error("히스토리 데이터 조회 실패:", error);
      setError("데이터를 불러오는데 실패했습니다.");
      setHistoryGraphs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedInstanceId, filters]);

  /** 필터 제거 */
  const removeFilter = (key: string) => {
    setFilters((prev) => prev.filter((f) => f.key !== key));
  };

  /** 날짜 처리 */
  const handleDateChange = (type: "start" | "end", value: string) => {
    const duration = filters.find((f) => f.key === "duration")?.value;

    if (!duration || duration === "0") {
      alert("먼저 기간을 선택해주세요.");
      return;
    }

    updateFilter(type, type === "start" ? "시작일" : "종료일", value);
  };

  // 기간 적용
  const handleDurationChange = (value: string) => {
    setFilters((prev) => prev.filter((f) => f.key !== "end"));
    updateFilter("duration", "기간", value);
  };

  const duration = filters.find((f) => f.key === "duration")?.value || "";

  return (
    <div className="history">
      {/* 필터 */}
      <div className="history__filters">
        <div className="history__filter-row">
          <Select
            label="기간"
            value={duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            options={[
              { label: "선택해주세요", value: "0" },
              { label: "1분", value: "1분" },
              { label: "10분", value: "10분" },
              { label: "1시간", value: "1시간" },
              { label: "하루", value: "하루" },
            ]}
          />

          {/* 날짜 */}
          {["1분", "10분", "1시간"].includes(duration) ? (
            <>
              <div className="date-input">
                <label className="date-input__label">시작일</label>
                <input
                  type="datetime-local"
                  value={filters.find((f) => f.key === "start")?.value || ""}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="date-input__field date-input__field--sm date-input__field--default"
                />
              </div>

              <div className="date-input">
                <label className="date-input__label">종료일</label>
                <input
                  type="datetime-local"
                  value={filters.find((f) => f.key === "end")?.value || ""}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="date-input__field date-input__field--sm date-input__field--default"
                />
              </div>
            </>
          ) : (
            <>
              <DateInput
                label="시작일"
                value={filters.find((f) => f.key === "start")?.value || ""}
                onChange={(e) => handleDateChange("start", e.target.value)}
              />
              <DateInput
                label="종료일"
                value={filters.find((f) => f.key === "end")?.value || ""}
                onChange={(e) => handleDateChange("end", e.target.value)}
              />
            </>
          )}

          {/* 카테고리 */}
          <Select
            label="카테고리"
            placeholder="선택해주세요."
            value={filters.find((f) => f.key === "category")?.value || ""}
            onChange={(e) => {
              updateFilter("category", "카테고리", e.target.value);
              updateFilter("graph", "그래프", "");
            }}
            options={[
              { label: "선택해주세요", value: "" },
              { label: "CPU", value: "CPU" },
              { label: "Memory", value: "MEMORY" },
              { label: "Session", value: "SESSION" },
              { label: "I/O", value: "IO" },
              { label: "Storage", value: "STORAGE" },
              { label: "Custom", value: "CUSTOM" },
            ]}
          />

          {/* 그래프 */}
          <Select
            label="그래프"
            placeholder="선택해주세요."
            value={filters.find((f) => f.key === "graph")?.value || ""}
            onChange={(e) => updateFilter("graph", "그래프", e.target.value)}
            options={[
              { label: "선택해주세요", value: "" },
              ...graphList.map((graph) => ({
                label: graph.name,
                value: String(graph.id),
              })),
            ]}
            disabled={!filters.find((f) => f.key === "category")?.value}
          />

          {/* 키워드 */}
          <Input
            label="키워드"
            size="lg"
            placeholder="검색어를 입력해주세요."
            value={filters.find((f) => f.key === "keyword")?.value || ""}
            onChange={(e) => updateFilter("keyword", "키워드", e.target.value)}
          />

          <Button
            text="검색"
            size="sm"
            variant="primary"
            onClick={handleSearch}
            disabled={isLoading || !selectedInstanceId}
          />
        </div>

        {/* 조건 표시 */}
        {filters.length > 0 && (
          <div className="history__conditions">
            <div className="history__conditions-title">검색 조건:</div>
            {filters.map((f) => {
              let displayValue = f.value;
              if (f.key === "graph") {
                const graph = graphList.find((g) => String(g.id) === f.value);
                if (graph) displayValue = graph.name;
              }
              return (
                <div key={f.key} className="history__chip">
                  <span>
                    {f.label}: {displayValue}
                  </span>
                  <button
                    className="history__chip-remove"
                    onClick={() => removeFilter(f.key)}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 탭 메뉴 */}
      <TabMenu
        tabs={TAB_ITEMS}
        activeTab={activeTab.toUpperCase()}
        onTabChange={(tab) => setActiveTab(tab.toLowerCase() as any)}
      />

      {/* 차트 영역 */}
      <div className="history__grid">
        {!selectedInstanceId ? (
          <div className="history__empty">
            <p>인스턴스를 선택해주세요.</p>
          </div>
        ) : isLoading ? (
          <div className="history__empty">
            <Spinner message="데이터 불러오는 중..." />
          </div>
        ) : error ? (
          <div className="history__empty">
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        ) : filteredGraphs.length === 0 ? (
          <div className="history__empty">
            <p>검색 조건을 설정하고 검색 버튼을 클릭해주세요.</p>
          </div>
        ) : (
          filteredGraphs.map((graph) => {
            const timeUnit = graphTimeUnits.get(graph.id) || "1d";
            const modeMap: Record<
              "1m" | "10m" | "1h" | "1d",
              "LIVE" | "10분" | "1시간" | "1일"
            > = {
              "1m": "LIVE",
              "10m": "10분",
              "1h": "1시간",
              "1d": "1일",
            };

            const graphDataForRender = {
              id: graph.id,
              name: graph.name,
              description: graph.description,
              type: graph.type,
              data: graph.data.map((p) => ({
                timestamp: p.timestamp,
                values: p.values,
              })),
            };

            return (
              <div key={graph.id} className="history__card">
                <ChartCard
                  title={graph.name}
                  status="normal"
                  showDragIcon={false}
                  showSettingIcon={false}
                  graphData={graphDataForRender}
                  mode={modeMap[timeUnit]}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;
