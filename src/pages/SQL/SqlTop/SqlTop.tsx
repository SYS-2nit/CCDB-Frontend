/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import "./SqlTop.scss";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import LineChart from "@/components/Chart/LineChart";
import DateInput from "@/components/Input/DateInput";
import BarGauge from "@/components/Chart/BarGauge";
import SqlDetailDrawer from "../Modal/SqlDetailDrawer";
import Select from "@/components/Select/Select";

import {
  getSqlDetail,
  getSqlCompareStats,
  getPeriodGraph,
  type SqlPeriodGraphItem,
} from "@/api/Sql/stats";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";

interface RankData {
  rank: number;
  rankChanged: React.ReactNode;
  ratio: number;
  exec: number;
  sqlId: string;
  query: string;
}

/* ============================================================
   SqlTop Component
============================================================ */
const SqlTop: React.FC = () => {
  /* ===== 날짜 기본값 ===== */
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const todayStr = `${yyyy}-${mm}-${dd}`;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yyyy2 = yesterday.getFullYear();
  const mm2 = String(yesterday.getMonth() + 1).padStart(2, "0");
  const dd2 = String(yesterday.getDate()).padStart(2, "0");

  const yesterdayStr = `${yyyy2}-${mm2}-${dd2}`;

  const [startDate, setStartDate] = useState(todayStr);
  const [compareDate, setCompareDate] = useState(yesterdayStr);

  /* ===== 필터 ===== */
  const [filter, setFilter] = useState("elapsed");

  const metricFieldMap: Record<string, string> = {
    elapsed: "elapsedUsDelta",
    wait: "waitTimeUsDelta",
    avg: "avgElapsed",
    execute: "executionsDelta",
  };

  const metricLabelMap: Record<string, string> = {
    elapsed: "Elapsed Time",
    wait: "Wait Time",
    avg: "Avg Elapsed",
    execute: "Execute Count",
  };

  const metricLabel = metricLabelMap[filter];

  const getMetricValue = (item: any, filter: string) => {
    const field = metricFieldMap[filter];
    return item[field] ?? 0;
  };

  /* ===== interval ===== */
  const [interval, setInterval] = useState(30);

  /* ===== 테이블 상태 ===== */
  const [baseList, setBaseList] = useState<RankData[]>([]);
  const [compareList, setCompareList] = useState<RankData[]>([]);

  /* ===== 기간 그래프 ===== */
  const [basePeriod, setBasePeriod] = useState<SqlPeriodGraphItem[]>([]);
  const [comparePeriod, setComparePeriod] = useState<SqlPeriodGraphItem[]>([]);

  /* ===== 상세 Drawer ===== */
  const [detailData, setDetailData] = useState<SqlDetailData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* ============================================================
     Rank Change 계산
  ============================================================ */
  const calcRankChange = (baseRank: number, compareRank: number) => {
    if (baseRank === 0 || compareRank === 0) return "-";

    const diff = compareRank - baseRank;
    if (diff > 0) return <span style={{ color: "#1E90FF" }}>▼ -{diff}</span>;
    if (diff < 0)
      return <span style={{ color: "#FF3B30" }}>▲ +{Math.abs(diff)}</span>;
    return "-";
  };

  /* ============================================================
     두 리스트를 동일한 sqlId 기준으로 정렬 (rank align)
  ============================================================ */
  const alignBySqlId = (baseList: RankData[], compareList: RankData[]) => {
    const sqlSet = new Set([
      ...baseList.map((b) => b.sqlId),
      ...compareList.map((c) => c.sqlId),
    ]);

    const allIds = Array.from(sqlSet);

    allIds.sort((a, b) => {
      const A = baseList.find((x) => x.sqlId === a);
      const B = compareList.find((x) => x.sqlId === b);
      if (A && B) return A.rank - B.rank;
      if (A) return -1;
      if (B) return 1;
      return 0;
    });

    const alignedBase: RankData[] = [];
    const alignedCompare: RankData[] = [];

    allIds.forEach((id) => {
      const base = baseList.find((b) => b.sqlId === id);
      const comp = compareList.find((c) => c.sqlId === id);

      const baseRank = base ? base.rank : 0;
      const compareRank = comp ? comp.rank : 0;
      const rankChanged = calcRankChange(baseRank, compareRank);

      const query = base?.query || comp?.query || "-";

      alignedBase.push(
        base || {
          rank: 0,
          rankChanged,
          ratio: 0,
          exec: 0,
          sqlId: id,
          query,
        }
      );

      alignedCompare.push(
        comp || {
          rank: 0,
          rankChanged,
          ratio: 0,
          exec: 0,
          sqlId: id,
          query,
        }
      );
    });

    return {
      alignedBase: alignedBase
        .map((r, i) => ({ ...r, rank: i + 1 }))
        .slice(0, 10),
      alignedCompare: alignedCompare
        .map((r, i) => ({ ...r, rank: i + 1 }))
        .slice(0, 10),
    };
  };

  /* ============================================================
     리스트 변환 함수
  ============================================================ */
  const convert = (list: any[], filter: string): RankData[] => {
    if (!list || list.length === 0) return [];

    const values = list.map((item) => getMetricValue(item, filter));
    const maxValue = Math.max(...values, 1);

    return list.slice(0, 10).map((item, i) => {
      const val = getMetricValue(item, filter);
      return {
        rank: i + 1,
        rankChanged: "-",
        ratio: Number(((val / maxValue) * 100).toFixed(1)),
        exec: val,
        sqlId: item.sqlId,
        query: item.sqlText ?? "-",
      };
    });
  };

  /* ============================================================
     검색 버튼 클릭 → Compare API 호출
  ============================================================ */
  const handleSearch = async () => {
    const data = await getSqlCompareStats({
      baseDate: startDate,
      compareDate,
      instanceId: 1,
      keyword: filter,
      intervalMinutes: interval,
    });

    const base = convert(data.baseList, filter);
    const comp = convert(data.compareList, filter);

    const { alignedBase, alignedCompare } = alignBySqlId(base, comp);

    setBaseList(alignedBase);
    setCompareList(alignedCompare);
  };

  /* ============================================================
     기간 전체 timeline 생성
  ============================================================ */
  const buildTimeline = (
    startDate: string,
    compareDate: string,
    intervalMinutes: number
  ): string[] => {
    const start = new Date(compareDate + "T00:00:00");
    const end = new Date(startDate + "T23:59:59");

    const timeline: string[] = [];

    while (start <= end) {
      const mm = String(start.getMonth() + 1).padStart(2, "0");
      const dd = String(start.getDate()).padStart(2, "0");
      const HH = String(start.getHours()).padStart(2, "0");
      const MM = String(start.getMinutes()).padStart(2, "0");

      timeline.push(`${mm}-${dd} ${HH}:${MM}`);

      start.setMinutes(start.getMinutes() + intervalMinutes);
    }

    return timeline;
  };

  /* timeline에 맞게 데이터 매핑 */
  const mapValuesToTimeline = (
    timeline: string[],
    data: SqlPeriodGraphItem[]
  ): number[] => {
    const map = new Map(data.map((d) => [d.datetime, d.value]));
    return timeline.map((t) => map.get(t) ?? 0);
  };

  /* ============================================================
     기간 그래프 가져오기
  ============================================================ */
  useEffect(() => {
    const fetchPeriod = async () => {
      const base = await getPeriodGraph({
        startDate,
        endDate: startDate,
        metric: filter,
        intervalMinutes: interval,
        instanceId: 1,
      });

      const compare = await getPeriodGraph({
        startDate: compareDate,
        endDate: compareDate,
        metric: filter,
        intervalMinutes: interval,
        instanceId: 1,
      });

      setBasePeriod(base);
      setComparePeriod(compare);
    };

    fetchPeriod();
  }, [startDate, compareDate, filter, interval]);

  /* ============================================================
     Row 클릭 → 상세 Drawer
  ============================================================ */
  const handleRowClick = async (row: RankData) => {
    try {
      const detail = await getSqlDetail({
        sqlId: row.sqlId,
        startDate,
        endDate: startDate,
        intervalMinutes: interval,
      });

      setDetailData(detail);
      setIsDrawerOpen(true);
    } catch (e) {
      console.error(e);
      alert("SQL 상세 조회 중 오류 발생");
    }
  };

  /* ============================================================
     테이블 컬럼 정의
  ============================================================ */
  const leftColumns = [
    { key: "rank", label: "rank" },
    { key: "rankChanged", label: "rank changed" },
    { key: "ratio", label: "ratio (%)" },
    { key: "exec", label: metricLabel },
    { key: "hash", label: "hash" },
    { key: "query", label: "query" },
  ];

  const rightColumns = [
    { key: "rank", label: "rank" },
    { key: "ratio", label: "ratio (%)" },
    { key: "exec", label: metricLabel },
    { key: "hash", label: "hash" },
    { key: "query", label: "query" },
  ];

  const leftRows = (data: RankData[]) =>
    data.map((row) => [
      row.rank,
      <span>{row.rankChanged}</span>,
      <BarGauge value={row.ratio} max={100} />,
      row.exec,
      row.sqlId,
      <span className="sql-top__query-link" onClick={() => handleRowClick(row)}>
        {row.query}
      </span>,
    ]);

  const rightRows = (data: RankData[]) =>
    data.map((row) => [
      row.rank,
      <BarGauge value={row.ratio} max={100} />,
      row.exec,
      row.sqlId,
      <span className="sql-top__query-link" onClick={() => handleRowClick(row)}>
        {row.query}
      </span>,
    ]);

  /* ============================================================
     Render
  ============================================================ */
  return (
    <div className="sql-top">
      {/* 검색 */}
      <div className="sql-top__header">
        <div className="sql-top__search">
          <div className="sql-stat__search-left">
            <DateInput
              label="기준 날짜"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <DateInput
              label="비교 날짜"
              value={compareDate}
              onChange={(e) => setCompareDate(e.target.value)}
            />

            <Select
              label="필터"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={[
                { label: "Elapsed Time", value: "elapsed" },
                { label: "Wait Time", value: "wait" },
                { label: "Avg Elapsed", value: "avg" },
                { label: "Execute Count", value: "execute" },
              ]}
            />

            <div className="sql-stat__search-left-btns">
              <Button
                text="30분"
                size="sm"
                variant={interval === 30 ? "primary" : "white"}
                onClick={() => setInterval(30)}
              />
              <Button
                text="1시간"
                size="sm"
                variant={interval === 60 ? "primary" : "white"}
                onClick={() => setInterval(60)}
              />
              <Button
                text="2시간"
                size="sm"
                variant={interval === 120 ? "primary" : "white"}
                onClick={() => setInterval(120)}
              />
            </div>
          </div>

          <div className="sql-stat__search-right">
            <Button
              text="검색"
              size="sm"
              variant="primary"
              onClick={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Summary Line Chart */}
      <div className="sql-top__summary">
        Summary Chart
        {(() => {
          const timeline = buildTimeline(startDate, compareDate, interval);
          const baseValues = mapValuesToTimeline(timeline, basePeriod);
          const compareValues = mapValuesToTimeline(timeline, comparePeriod);

          return (
            <LineChart
              legends={["기준", "비교"]}
              seriesData={[baseValues, compareValues]}
              categories={timeline}
            />
          );
        })()}
      </div>

      {/* 테이블 */}
      <div className="sql-top__table">
        <div className="sql-top__table-block">
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-mainCircle" />
            기준 데이터 ({startDate})
          </div>
          <TableChart columns={leftColumns} rows={leftRows(baseList)} />
        </div>

        <div className="sql-top__table-block">
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-greenCircle" />
            비교 데이터 ({compareDate})
          </div>
          <TableChart columns={rightColumns} rows={rightRows(compareList)} />
        </div>
      </div>

      {/* 상세 Drawer */}
      {isDrawerOpen && detailData && (
        <SqlDetailDrawer
          data={detailData}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default SqlTop;
