/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

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

// 상태 + 데이터 로직 담당 Custom Hook
export const useSqlTop = () => {
  /* 날짜 */
  const [startDate, setStartDate] = useState("");
  const [compareDate, setCompareDate] = useState("");

  /* 필터 & Interval */
  const [filter, setFilter] = useState("");
  const [interval, setInterval] = useState(30);

  /* 리스트 */
  const [baseList, setBaseList] = useState<RankData[]>([]);
  const [compareList, setCompareList] = useState<RankData[]>([]);

  /* 기간 그래프 */
  const [, setBasePeriod] = useState<any[]>([]);
  const [, setComparePeriod] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<string[]>([]);
  const [baseValues, setBaseValues] = useState<number[]>([]);
  const [compareValues, setCompareValues] = useState<number[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  /* 상세 */
  const [detailData, setDetailData] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* 비교 체크 */
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedCompare, setSelectedCompare] = useState<string | null>(null);

  const metricLabel = metricLabelMap[filter];

  /* Compare 리스트 */
  const loadCompareList = async () => {
    try {
      const data = await fetchCompareStats({
        baseDate: startDate,
        compareDate,
        instanceId: 1,
        keyword: filter,
        intervalMinutes: interval,
      });

      const base = convertList(data.baseList, filter);
      const comp = convertList(data.compareList, filter);

      const aligned = alignBySqlId(base, comp);

      setBaseList(aligned.base);
      setCompareList(aligned.compare);
    } catch (err) {
      console.error("비교 리스트 로드 실패:", err);
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
        metric: filter,
        intervalMinutes: interval,
        instanceId: 1,
      });

      const compare = await fetchPeriodData({
        startDate: compareDate,
        endDate: compareDate,
        metric: filter,
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
      console.error("기간 그래프 로드 실패:", err);
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
    const raw = await fetchSqlDetail({
      sqlId: row.sqlId,
      startDate,
      endDate: startDate,
      intervalMinutes: interval,
    });

    setDetailData({ date: startDate, ...raw });
    setIsDrawerOpen(true);
  };

  const handleCompareRowClick = async (row: RankData) => {
    const raw = await fetchSqlDetail({
      sqlId: row.sqlId,
      startDate: compareDate,
      endDate: compareDate,
      intervalMinutes: interval,
    });

    setDetailData({ date: compareDate, ...raw });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  /* 비교 팝업 */
  const fetchCompareDetails = async () => {
    if (!selectedBase || !selectedCompare) return;

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
    if (!popup) return;

    popup.document.write(`<div id="compare-root"></div>`);
    popup.document.close();

    const rootEl = popup.document.getElementById("compare-root");
    if (!rootEl) return;

    import("react-dom/client").then(({ createRoot }) => {
      const root = createRoot(rootEl);
      root.render(
        <CompareSqlWindow
          base={{ date: startDate, detail: base }}
          compare={{ date: compareDate, detail: compare }}
        />
      );
    });
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
