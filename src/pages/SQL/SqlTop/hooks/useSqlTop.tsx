// eslint-disable-next-line react-hooks/exhaustive-deps
// 의존성 배열에 loadCompareList, loadPeriodGraph를 포함하면 무한 루프 발생 가능
import { useEffect, useState } from "react";
import CompareSqlWindow from "../Window/CompareSqlWindow";
import {
  fetchCompareStats,
  fetchPeriodData,
  fetchSqlDetail,
} from "../services/sqlTopService";

import { metricLabelMap } from "../components/metric";
import { alignBySqlId, convertList, type RankData } from "../components/rank";
import { buildTimeline, mapValuesToTimeline } from "../components/timeline";
import type {
  SqlFilterType,
  IntervalType,
  PeriodGraphItem,
  SqlDetailDrawerData,
} from "../../types";
import { convertSqlDetailToDrawerData } from "../../utils/convertSqlDetail";
import { logError } from "../../utils/errorHandler";

// 상태 + 데이터 로직 담당 Custom Hook
export const useSqlTop = () => {
  /* 날짜 */
  const [startDate, setStartDate] = useState("");
  const [compareDate, setCompareDate] = useState("");

  /* 필터 & Interval */
  const [filter, setFilter] = useState<SqlFilterType | "">("");
  const [interval, setInterval] = useState<IntervalType>(30);

  /* 리스트 */
  const [baseList, setBaseList] = useState<RankData[]>([]);
  const [compareList, setCompareList] = useState<RankData[]>([]);

  /* 기간 그래프 */
  const [, setBasePeriod] = useState<PeriodGraphItem[]>([]);
  const [, setComparePeriod] = useState<PeriodGraphItem[]>([]);
  const [timeline, setTimeline] = useState<string[]>([]);
  const [baseValues, setBaseValues] = useState<number[]>([]);
  const [compareValues, setCompareValues] = useState<number[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  /* 상세 */
  const [detailData, setDetailData] = useState<SqlDetailDrawerData | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* 비교 체크 */
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedCompare, setSelectedCompare] = useState<string | null>(null);

  const metricLabel = filter ? metricLabelMap[filter] : "";

  /* Compare 리스트 */
  const loadCompareList = async () => {
    try {
      const data = await fetchCompareStats({
        baseDate: startDate,
        compareDate,
        instanceId: 1,
        keyword: filter || undefined,
        intervalMinutes: interval,
      });

      const base = convertList(
        data.baseList,
        (filter || "elapsed") as SqlFilterType
      );
      const comp = convertList(
        data.compareList,
        (filter || "elapsed") as SqlFilterType
      );

      const aligned = alignBySqlId(base, comp);

      setBaseList(aligned.base);
      setCompareList(aligned.compare);
    } catch (err) {
      logError("SQL 비교 리스트 로드", err);
      setBaseList([]);
      setCompareList([]);
    }
  };

  useEffect(() => {
    if (startDate && compareDate && filter) {
      loadCompareList();
    } else {
      setBaseList([]);
      setCompareList([]);
    }
  }, [startDate, compareDate, filter, interval]);

  /* 기간 그래프 */
  const loadPeriodGraph = async () => {
    setIsChartLoading(true);
    try {
      const base = await fetchPeriodData({
        startDate,
        endDate: startDate,
        metric: filter || "elapsed",
        intervalMinutes: interval,
        instanceId: 1,
      });

      const compare = await fetchPeriodData({
        startDate: compareDate,
        endDate: compareDate,
        metric: filter || "elapsed",
        intervalMinutes: interval,
        instanceId: 1,
      });

      const t = buildTimeline(startDate, compareDate, interval);

      setTimeline(t);
      setBasePeriod(base);
      setComparePeriod(compare);
      setBaseValues(mapValuesToTimeline(t, base));
      setCompareValues(mapValuesToTimeline(t, compare));
    } catch (err) {
      logError("SQL 기간 그래프 로드", err);
      setTimeline([]);
      setBaseValues([]);
      setCompareValues([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && compareDate && filter) {
      loadPeriodGraph();
    } else {
      setTimeline([]);
      setBaseValues([]);
      setCompareValues([]);
    }
  }, [startDate, compareDate, filter, interval]);

  /* 상세 */
  const handleBaseRowClick = async (row: RankData) => {
    try {
      const raw = await fetchSqlDetail({
        sqlId: row.sqlId,
        startDate,
        endDate: startDate,
        intervalMinutes: interval,
      });

      setDetailData(convertSqlDetailToDrawerData(raw, startDate));
      setIsDrawerOpen(true);
    } catch (err) {
      logError("SQL 상세 데이터 로드 (기준)", err);
    }
  };

  const handleCompareRowClick = async (row: RankData) => {
    try {
      const raw = await fetchSqlDetail({
        sqlId: row.sqlId,
        startDate: compareDate,
        endDate: compareDate,
        intervalMinutes: interval,
      });

      setDetailData(convertSqlDetailToDrawerData(raw, compareDate));
      setIsDrawerOpen(true);
    } catch (err) {
      logError("SQL 상세 데이터 로드 (비교)", err);
    }
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  /* 비교 팝업 */
  const fetchCompareDetails = async () => {
    if (!selectedBase || !selectedCompare) return;

    try {
      const base = await fetchSqlDetail({
        sqlId: selectedBase,
        startDate,
        endDate: startDate,
        intervalMinutes: interval,
      });

      const compare = await fetchSqlDetail({
        sqlId: selectedCompare,
        startDate: compareDate,
        endDate: compareDate,
        intervalMinutes: interval,
      });

      const popup = window.open("", "_blank", "width=1600,height=900");
      if (!popup) {
        logError("SQL 비교 팝업", new Error("팝업 창을 열 수 없습니다."));
        return;
      }

      popup.document.write(`<div id="compare-root"></div>`);
      popup.document.close();

      const rootEl = popup.document.getElementById("compare-root");
      if (!rootEl) {
        logError("SQL 비교 팝업", new Error("루트 엘리먼트를 찾을 수 없습니다."));
        return;
      }

      import("react-dom/client").then(({ createRoot }) => {
        const root = createRoot(rootEl);
        root.render(
          <CompareSqlWindow
            base={{ date: startDate, detail: convertSqlDetailToDrawerData(base, startDate) }}
            compare={{ date: compareDate, detail: convertSqlDetailToDrawerData(compare, compareDate) }}
          />
        );
      }).catch((err) => {
        logError("SQL 비교 팝업 렌더링", err);
      });
    } catch (err) {
      logError("SQL 비교 상세 데이터 로드", err);
    }
  };

  return {
    startDate,
    compareDate,
    setStartDate,
    setCompareDate,
    filter,
    setFilter,
    interval,
    setInterval,
    metricLabel,
    baseList,
    compareList,
    timeline,
    baseValues,
    compareValues,
    isChartLoading,
    selectedBase,
    selectedCompare,
    setSelectedBase,
    setSelectedCompare,
    handleBaseRowClick,
    handleCompareRowClick,
    fetchCompareDetails,
    isDrawerOpen,
    detailData,
    closeDrawer,
  };
};
