/* eslint-disable react-hooks/exhaustive-deps */
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
import Checkbox from "@/components/Checkbox/Checkbox";

import {
  getSqlDetail,
  getSqlCompareStats,
  getPeriodGraph,
  type SqlPeriodGraphItem,
} from "@/api/Sql/sql";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";

// 새 창 전용 비교 컴포넌트
import CompareSqlWindow from "./Window/CompareSqlWindow";

/* ===============================
   Rank Row Type
================================*/
interface RankData {
  rank: number;
  rankChanged: React.ReactNode;
  ratio: number;
  exec: number;
  sqlId: string;
  query: string;
}

const SqlTop: React.FC = () => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [compareDate, setCompareDate] = useState(yesterdayStr);

  /* 필터 */
  const [filter, setFilter] = useState("");

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

  /* interval */
  const [interval, setInterval] = useState(30);

  /* 리스트 상태 */
  const [baseList, setBaseList] = useState<RankData[]>([]);
  const [compareList, setCompareList] = useState<RankData[]>([]);

  /* 기간 그래프 */
  const [basePeriod, setBasePeriod] = useState<SqlPeriodGraphItem[]>([]);
  const [comparePeriod, setComparePeriod] = useState<SqlPeriodGraphItem[]>([]);

  /* 단일 상세 Drawer */
  const [detailData, setDetailData] = useState<SqlDetailData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  /* 체크박스 */
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedCompare, setSelectedCompare] = useState<string | null>(null);

  /* Rank 변화 */
  const calcRankChange = (baseRank: number, compareRank: number) => {
    if (baseRank === 0 || compareRank === 0) return "-";
    const diff = compareRank - baseRank;

    if (diff > 0) return <span style={{ color: "#1E90FF" }}>▼ -{diff}</span>;
    if (diff < 0)
      return <span style={{ color: "#FF3B30" }}>▲ +{Math.abs(diff)}</span>;
    return "-";
  };

  /* 리스트 정렬 */
  const alignBySqlId = (base: RankData[], compare: RankData[]) => {
    const sqlIds = new Set([
      ...base.map((b) => b.sqlId),
      ...compare.map((c) => c.sqlId),
    ]);
    const allIds = Array.from(sqlIds);

    allIds.sort((a, b) => {
      const A = base.find((x) => x.sqlId === a);
      const B = compare.find((x) => x.sqlId === b);
      if (A && B) return A.rank - B.rank;
      if (A) return -1;
      if (B) return 1;
      return 0;
    });

    const alignedBase: RankData[] = [];
    const alignedCompare: RankData[] = [];

    allIds.forEach((id) => {
      const baseRow = base.find((b) => b.sqlId === id);
      const compareRow = compare.find((c) => c.sqlId === id);

      const baseRank = baseRow?.rank ?? 0;
      const compareRank = compareRow?.rank ?? 0;
      const rankChanged = calcRankChange(baseRank, compareRank);

      const query = baseRow?.query ?? compareRow?.query ?? "-";

      alignedBase.push(
        baseRow || {
          rank: 0,
          rankChanged,
          ratio: 0,
          exec: 0,
          sqlId: id,
          query,
        }
      );

      alignedCompare.push(
        compareRow || {
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

  /* 리스트 변환 */
  const convert = (list: any[], filter: string): RankData[] => {
    if (!list || list.length === 0) return [];

    const values = list.map((item) => getMetricValue(item, filter));
    const maxValue = Math.max(...values, 1);

    return list.slice(0, 10).map((item, i) => ({
      rank: i + 1,
      rankChanged: "-",
      ratio: Number(
        ((getMetricValue(item, filter) / maxValue) * 100).toFixed(1)
      ),
      exec: getMetricValue(item, filter),
      sqlId: item.sqlId,
      query: item.sqlText ?? "-",
    }));
  };

  /* 비교 테이블 가져오기 */
  const fetchCompare = async () => {
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

  useEffect(() => {
    fetchCompare();
  }, [startDate, compareDate, filter, interval]);

  /* Timeline */
  const buildTimeline = (
    startDate: string,
    compareDate: string,
    interval: number
  ) => {
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(compareDate + "T23:59:59");

    const timeline: string[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      timeline.push(
        `${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
          cursor.getDate()
        ).padStart(2, "0")} ${String(cursor.getHours()).padStart(
          2,
          "0"
        )}:${String(cursor.getMinutes()).padStart(2, "0")}`
      );
      cursor.setMinutes(cursor.getMinutes() + interval);
    }

    return timeline;
  };

  const mapValuesToTimeline = (
    timeline: string[],
    data: SqlPeriodGraphItem[]
  ) => {
    const map = new Map(
      data.map((d) => {
        const date = new Date(d.datetime);
        const key = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")} ${String(date.getHours()).padStart(
          2,
          "0"
        )}:${String(date.getMinutes()).padStart(2, "0")}`;
        return [key, d.value];
      })
    );

    return timeline.map((t) => map.get(t) ?? 0);
  };

  /* 기간 그래프 */
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

  /* 단일 상세 조회 */
  const handleRowClick = async (row: RankData) => {
    const raw = await getSqlDetail({
      sqlId: row.sqlId,
      startDate,
      endDate: startDate,
      intervalMinutes: interval,
    });

    setDetailData({
      date: startDate,
      ...raw,
    });

    setIsDrawerOpen(true);
  };

  /* 비교 상세 조회 → 새 창 */
  const fetchCompareDetails = async () => {
    if (!selectedBase || !selectedCompare) return;

    const base = await getSqlDetail({
      sqlId: selectedBase,
      startDate,
      endDate: startDate,
      intervalMinutes: interval,
    });

    const compare = await getSqlDetail({
      sqlId: selectedCompare,
      startDate: compareDate,
      endDate: compareDate,
      intervalMinutes: interval,
    });

    /** 새 창 생성 */
    const popup = window.open("", "_blank", "width=1600,height=900");

    if (!popup) {
      alert("팝업 차단이 감지되었습니다. 팝업 허용 후 다시 시도해주세요.");
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>SQL 상세 비교</title>
          <style>
            body { margin: 0; }
          </style>
        </head>
        <body>
          <div id="compare-root"></div>
        </body>
      </html>
    `);

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

  /* ===============================
     UI
  =============================== */
  return (
    <div className="sql-top">
      {/* 검색 영역 */}
      <div className="sql-top__header">
        <div className="sql-top__search">
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
            placeholder="선택하세요."
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
      </div>

      {/* Summary Chart */}
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
        {/* 기준 */}
        <div className="sql-top__table-block">
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-left">
              <div className="sql-top__table-block-header-left-mainCircle" />
              기준 데이터 ({startDate})
            </div>
          </div>
          {baseList.length === 0 ? (
            <div className="no-result">검색 결과가 없습니다</div>
          ) : (
            <TableChart
              columns={[
                { key: "check", label: "check" },
                { key: "rankChanged", label: "rank changed" },
                { key: "ratio", label: "ratio" },
                { key: "exec", label: metricLabel || "필터" },
                { key: "hash", label: "hash" },
                { key: "query", label: "query" },
              ]}
              rows={baseList.map((row) => [
                <Checkbox
                  checked={selectedBase === row.sqlId}
                  onChange={() =>
                    setSelectedBase(
                      selectedBase === row.sqlId ? null : row.sqlId
                    )
                  }
                  size="sm"
                />,
                <span>{row.rankChanged}</span>,
                <BarGauge value={row.ratio} max={100} />,
                row.exec,
                row.sqlId,
                <span
                  className="sql-top__query-link"
                  onClick={() => handleRowClick(row)}
                >
                  {row.query}
                </span>,
              ])}
            />
          )}
        </div>

        {/* 비교 */}
        <div className="sql-top__table-block">
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-left">
              <div className="sql-top__table-block-header-left-greenCircle" />
              비교 데이터 ({compareDate})
            </div>
            <div className="sql-top__table-block-header-right">
              <Button
                text="비교하기"
                size="sm"
                variant="primary"
                disabled={!selectedBase || !selectedCompare}
                onClick={fetchCompareDetails}
              />
            </div>
          </div>
          {baseList.length === 0 ? (
            <div className="no-result">검색 결과가 없습니다</div>
          ) : (
            <TableChart
              columns={[
                { key: "check", label: "check" },
                { key: "ratio", label: "ratio" },
                { key: "exec", label: metricLabel || "필터" },
                { key: "hash", label: "hash" },
                { key: "query", label: "query" },
              ]}
              rows={compareList.map((row) => [
                <Checkbox
                  checked={selectedCompare === row.sqlId}
                  onChange={() =>
                    setSelectedCompare(
                      selectedCompare === row.sqlId ? null : row.sqlId
                    )
                  }
                  size="sm"
                />,
                <BarGauge value={row.ratio} max={100} />,
                row.exec,
                row.sqlId,
                <span
                  className="sql-top__query-link"
                  onClick={() => handleRowClick(row)}
                >
                  {row.query}
                </span>,
              ])}
            />
          )}
        </div>
      </div>

      {/* 단일 상세 Drawer */}
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
