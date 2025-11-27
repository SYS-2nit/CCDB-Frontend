/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
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
import { fetchEventRuleDetail } from "@/api/Alert/alerts";
import { useDashboardContext } from "@/state/DashboardContext";
import ChartCard from "@/components/Card/ChartCard";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */
import Spinner from "@/components/Spinner/Spinner";
import TabMenu from "@/components/Tabs/TabMenu";

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
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [alertGraphId, setAlertGraphId] = useState<number | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<number | null>(null);
  const [lastProcessedParams, setLastProcessedParams] = useState<string>("");
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);

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

  // URL 파라미터에서 필터 설정 (알림 클릭 시 자동 설정, 변경될 때마다 처리)
  useEffect(() => {
    const urlStart = searchParams.get("start");
    const urlEnd = searchParams.get("end");
    const urlCategory = searchParams.get("category");
    const urlDuration = searchParams.get("duration");
    const urlAlertEventId = searchParams.get("alertEventId");
    const urlSeverity = searchParams.get("severity");

    // 현재 파라미터를 문자열로 만들어서 이전과 비교
    const currentParams = `${urlStart}|${urlEnd}|${urlCategory}|${urlDuration}|${urlAlertEventId}|${urlSeverity}`;

    // 파라미터가 변경되지 않았으면 스킵
    if (currentParams === lastProcessedParams) return;

    // 파라미터가 없으면 스킵 (초기 로드 시)
    if (
      !urlStart &&
      !urlEnd &&
      !urlCategory &&
      !urlDuration &&
      !urlAlertEventId &&
      !urlSeverity
    ) {
      return;
    }

    // AlertEvent 조회하여 graphId 얻기
    if (urlAlertEventId) {
      const loadAlertEvent = async () => {
        try {
          const alertEvent = await fetchEventRuleDetail(
            Number(urlAlertEventId)
          );
          console.log("[History] AlertEvent 조회 결과:", {
            alertEventId: urlAlertEventId,
            graphId: alertEvent.graphId,
            graphName: alertEvent.graphName,
            fullAlertEvent: alertEvent
          });
          
          if (alertEvent.graphId) {
            setAlertGraphId(alertEvent.graphId);
            console.log("[History] alertGraphId 설정:", alertEvent.graphId);
          } else {
            console.warn("[History] graphId가 null입니다:", alertEvent);
            setAlertGraphId(null);
          }
        } catch (error) {
          console.error("[History] AlertEvent 조회 실패:", error);
          setAlertGraphId(null);
        }
      };
      void loadAlertEvent();
    } else {
      setAlertGraphId(null);
    }

    if (urlSeverity) {
      setAlertSeverity(Number(urlSeverity));
    } else {
      setAlertSeverity(null);
    }

    // URL 파라미터가 있으면 필터 설정
    if (urlStart || urlEnd || urlCategory || urlDuration) {
      const newFilters: FilterItem[] = [];

      if (urlDuration) {
        newFilters.push({ key: "duration", label: "기간", value: urlDuration });
      }

      if (urlStart) {
        newFilters.push({ key: "start", label: "시작일", value: urlStart });
      }

      if (urlEnd) {
        newFilters.push({ key: "end", label: "종료일", value: urlEnd });
      }

      if (urlCategory) {
        newFilters.push({
          key: "category",
          label: "카테고리",
          value: urlCategory,
        });
        // 카테고리에 맞는 탭 설정
        const categoryLower = urlCategory.toLowerCase();
        if (
          ["cpu", "memory", "session", "io", "storage"].includes(categoryLower)
        ) {
          setActiveTab(
            categoryLower as "cpu" | "memory" | "session" | "io" | "storage"
          );
        }
      }

      setFilters(newFilters);
      setLastProcessedParams(currentParams);
      // 필터가 변경되면 기존 그래프 데이터 초기화 (새로운 검색을 위해)
      setHistoryGraphs([]);
      // 자동 검색 플래그 설정
      setShouldAutoSearch(true);

      // URL 파라미터 정리 (처리 후 제거) - 즉시 실행하여 재실행 방지
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("start");
      newSearchParams.delete("end");
      newSearchParams.delete("category");
      newSearchParams.delete("duration");
      newSearchParams.delete("instanceId");
      newSearchParams.delete("alertEventId");
      newSearchParams.delete("severity");
      setSearchParams(newSearchParams, { replace: true });
    } else {
      setLastProcessedParams(currentParams);
    }
  }, [searchParams, setSearchParams, lastProcessedParams]);

  // GraphId 기반 카테고리 필터링
  const getCategoryByGraphId = (
    graphId: number
  ):
    | "cpu"
    | "memory"
    | "session"
    | "io"
    | "storage"
    | "custom"
    | "main"
    | null => {
    if (graphId >= 1 && graphId <= 12) return "custom";
    if (graphId >= 13 && graphId <= 20) return "cpu";
    if (graphId >= 21 && graphId <= 28) return "memory";
    if (graphId >= 29 && graphId <= 36) return "session";
    if (graphId >= 37 && graphId <= 44) return "io";
    if (graphId >= 45 && graphId <= 52) return "storage";
    return "main";
  };

  const filteredGraphs = historyGraphs.filter((graph) => {
    const category = getCategoryByGraphId(graph.id);
    return category === activeTab;
  });

  // 그래프 정렬: alertGraphId가 있으면 맨 앞으로
  const sortedGraphs = React.useMemo(() => {
    console.log("[History] 그래프 정렬:", {
      alertGraphId,
      filteredGraphsCount: filteredGraphs.length,
      filteredGraphIds: filteredGraphs.map(g => g.id),
      alertGraphInFiltered: filteredGraphs.find((g) => g.id === alertGraphId)
    });
    
    if (!alertGraphId) return filteredGraphs;

    const alertGraph = filteredGraphs.find((g) => g.id === alertGraphId);
    const otherGraphs = filteredGraphs.filter((g) => g.id !== alertGraphId);

    console.log("[History] 정렬 결과:", {
      alertGraph: alertGraph ? { id: alertGraph.id, name: alertGraph.name } : null,
      otherGraphsCount: otherGraphs.length
    });

    return alertGraph ? [alertGraph, ...otherGraphs] : filteredGraphs;
  }, [filteredGraphs, alertGraphId]);

  // 심각도별 테두리 색상
  const getBorderColor = (graphId: number): string | undefined => {
    if (graphId === alertGraphId && alertSeverity) {
      switch (alertSeverity) {
        case 1:
          return "#FACC15"; // 주의
        case 2:
          return "#DC2626"; // 위험
        case 3:
          return "#151515"; // 치명
        default:
          return undefined;
      }
    }
    return undefined;
  };

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
    // URL 파라미터에서 instanceId 가져오기 (알림 클릭 시 전달됨)
    const urlInstanceId = searchParams.get("instanceId");
    const targetInstanceId = urlInstanceId
      ? Number(urlInstanceId)
      : selectedInstanceId;

    if (!targetInstanceId) {
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
        instanceId: targetInstanceId,
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
  }, [selectedInstanceId, filters, searchParams]);

  // 필터가 설정되면 자동 검색 실행 (URL 파라미터로 들어온 경우)
  useEffect(() => {
    // 자동 검색 플래그가 있고, 필터가 설정되어 있고, 로딩 중이 아니면 검색 실행
    if (shouldAutoSearch && !isLoading) {
      const hasStartOrEnd = filters.some(
        (f) => f.key === "start" || f.key === "end"
      );
      const hasCategory = filters.some((f) => f.key === "category");

      if (hasStartOrEnd || hasCategory) {
        // 약간의 지연을 두어 필터 설정이 완전히 완료된 후 검색 실행
        const timer = setTimeout(() => {
          handleSearch();
          setShouldAutoSearch(false); // 검색 실행 후 플래그 해제
        }, 200);
        return () => clearTimeout(timer);
      } else {
        setShouldAutoSearch(false); // 필터가 없으면 플래그 해제
      }
    }
  }, [shouldAutoSearch, filters, isLoading, handleSearch]);

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
          sortedGraphs.map((graph) => {
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

            const borderColor = getBorderColor(graph.id);

            return (
              <div
                key={graph.id}
                className="history__card"
                style={
                  borderColor
                    ? {
                        border: `3px solid ${borderColor}`,
                        borderRadius: "8px",
                        boxSizing: "border-box",
                      }
                    : {}
                }
              >
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