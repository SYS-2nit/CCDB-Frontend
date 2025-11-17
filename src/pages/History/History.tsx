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
} from "@/api/history";
import { useDashboardContext } from "@/state/DashboardContext";
import ChartCard from "@/components/Card/ChartCard";
import Spinner from "@/components/Spinner/Spinner";

interface FilterItem {
  key: string;
  label: string;
  value: string;
}

// 카테고리 옵션
const CATEGORY_OPTIONS = [
  { label: "CPU", value: "CPU" },
  { label: "Memory", value: "MEMORY" },
  { label: "Session", value: "SESSION" },
  { label: "I/O", value: "IO" },
  { label: "Storage", value: "STORAGE" },
  { label: "Custom", value: "CUSTOM" },
];

// 시간 단위 매핑 (프론트엔드 표시용 -> 백엔드 형식)
const TIME_UNIT_MAP: Record<string, "1m" | "10m" | "1h" | "1d"> = {
  "1분": "1m",
  "10분": "10m",
  "1시간": "1h",
  하루: "1d",
};

const History: React.FC = () => {
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

  /** 공통 업데이트 함수 */
  const updateFilter = useCallback(
    (key: string, label: string, value: string) => {
      setFilters((prev) => {
        if (!value || value === "0" || value === "") {
          return prev.filter((f) => f.key !== key);
        }
        const exists = prev.find((f) => f.key === key);
        if (exists) {
          return prev.map((f) => (f.key === key ? { ...f, value } : f));
        } else {
          return [...prev, { key, label, value }];
        }
      });
    },
    []
  );

  /** 카테고리 선택 시 그래프 리스트 조회 */
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

  /** 검색 버튼 클릭 핸들러 */
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

    // 시작일 또는 종료일이 없으면 경고
    if (!startDate && !endDate) {
      alert("시작일 또는 종료일을 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 날짜 형식 변환 (datetime-local 또는 date -> ISO 8601)
      let startDateTime: string | undefined;
      let endDateTime: string | undefined;

      if (startDate) {
        // datetime-local 형식이면 그대로 사용, date 형식이면 시간 추가
        if (startDate.includes("T")) {
          startDateTime = startDate + ":00"; // 초 추가
        } else {
          startDateTime = startDate + "T00:00:00";
        }
      }

      if (endDate) {
        if (endDate.includes("T")) {
          endDateTime = endDate + ":00"; // 초 추가
        } else {
          endDateTime = endDate + "T23:59:59";
        }
      }

      // 시간 단위 변환
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

      // 각 그래프의 기본 시간 단위 설정
      const newTimeUnits = new Map<number, "1m" | "10m" | "1h" | "1d">();
      response.graphs?.forEach((graph) => {
        newTimeUnits.set(graph.id, timeUnit);
      });
      setGraphTimeUnits(newTimeUnits);
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

  /** 날짜 및 시간 유효성 검사 */
  const handleDateChange = (type: "start" | "end", value: string) => {
    const duration = filters.find((f) => f.key === "duration")?.value;

    // 기간 미선택 시
    if (!duration || duration === "0") {
      alert("먼저 기간을 선택해주세요.");
      return;
    }

    const start =
      type === "start" ? value : filters.find((f) => f.key === "start")?.value;
    const end =
      type === "end" ? value : filters.find((f) => f.key === "end")?.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      // 종료일이 시작일보다 빠를 경우
      if (endDate.getTime() < startDate.getTime()) {
        alert("종료일은 시작일보다 이후여야 합니다.");
        return;
      }

      // 같은 날 검증
      const sameDay =
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() === endDate.getDate();

      if (["1분", "10분", "1시간"].includes(duration) && !sameDay) {
        alert("1분, 10분, 1시간 단위는 같은 날 내에서만 선택 가능합니다.");
        return;
      }

      // 10분 단위 정렬 검증
      if (duration === "10분") {
        const startMin = startDate.getMinutes();
        const endMin = endDate.getMinutes();

        // 예: 시작이 01:02면 종료는 01:12, 01:22 등 '분의 일의 자리'가 같아야 함
        if (startMin % 10 !== endMin % 10) {
          alert(
            "10분 단위는 시작 시간의 일 단위와 동일해야 합니다. \n(예: 1:00 -> 1:10)"
          );
          return;
        }
      }

      // 1시간 단위 정렬 검증
      if (duration === "1시간") {
        const startMin = startDate.getMinutes();
        const endMin = endDate.getMinutes();

        if (startMin !== endMin) {
          alert(
            "1시간 단위는 시작 시각의 분 단위와 동일해야 합니다. \n(예: 01:00 → 02:00)"
          );
          return;
        }
      }
    }

    updateFilter(type, type === "start" ? "시작일" : "종료일", value);
  };

  // 기간 변경 시 종료일 초기화
  const handleDurationChange = (value: string) => {
    setFilters((prev) => prev.filter((f) => f.key !== "end"));
    updateFilter("duration", "기간", value);
  };

  const duration = filters.find((f) => f.key === "duration")?.value || "";

  return (
    <div className="history">
      {/* 1행: 필터 영역 */}
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

          {/* 시간 단위일 경우 datetime-local */}
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

          <Select
            label="카테고리"
            placeholder="선택해주세요."
            value={filters.find((f) => f.key === "category")?.value || ""}
            onChange={(e) => {
              updateFilter("category", "카테고리", e.target.value);
              // 카테고리 변경 시 그래프 필터 초기화
              updateFilter("graph", "그래프", "");
            }}
            options={[
              { label: "선택해주세요", value: "" },
              ...CATEGORY_OPTIONS,
            ]}
          />

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

        {/* 2행: 조건 표시 */}
        {filters.length > 0 && (
          <div className="history__conditions">
            <div className="history__conditions-title">검색 조건:</div>
            {filters.map((f) => {
              // 그래프 ID인 경우 그래프 이름으로 변환
              let displayValue = f.value;
              if (f.key === "graph" && f.value) {
                const graph = graphList.find((g) => String(g.id) === f.value);
                if (graph) {
                  displayValue = graph.name;
                }
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

      {/* 차트 카드 */}
      <div className="history__grid">
        {!selectedInstanceId ? (
          <div className="history__empty">
            <p>인스턴스를 선택해주세요.</p>
          </div>
        ) : isLoading ? (
          <div className="history__empty">
            <Spinner />
          </div>
        ) : error ? (
          <div className="history__empty">
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        ) : historyGraphs.length === 0 ? (
          <div className="history__empty">
            <p>검색 조건을 설정하고 검색 버튼을 클릭해주세요.</p>
          </div>
        ) : (
          historyGraphs.map((graph) => {
            const timeUnit = graphTimeUnits.get(graph.id) || "1d";
            // timeUnit을 DashboardMode로 변환
            const modeMap: Record<
              "1m" | "10m" | "1h" | "1d",
              "LIVE" | "10분" | "1시간" | "1일"
            > = {
              "1m": "LIVE",
              "10m": "10분",
              "1h": "1시간",
              "1d": "1일",
            };
            const chartMode = modeMap[timeUnit] || "1일";

            // GraphDataResponse 형식으로 변환 (호환성)
            const graphDataForRender = {
              id: graph.id,
              name: graph.name,
              description: graph.description,
              type: graph.type,
              data: graph.data.map((point) => ({
                timestamp: point.timestamp,
                values: point.values,
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
                  mode={chartMode}
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
