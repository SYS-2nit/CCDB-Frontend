/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState } from "react";
import "./SqlTop.scss";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import LineChart from "@/components/Chart/LineChart";
import DateInput from "@/components/Input/DateInput";
import BarGauge from "@/components/Chart/BarGauge";
import SqlDetailDrawer from "../Modal/SqlDetailDrawer";
import Select from "@/components/Select/Select";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";
import { getSqlDetail } from "@/api/Sql/stats";

interface RankData {
  rank: number;
  rankChanged: string;
  ratio: number;
  exec: number;
  sqlId: string;
  query: string;
}

const SqlTop: React.FC = () => {
  // 상태들
  const [interval, setInterval] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [compareDate, setCompareDate] = useState("");

  // 상세 Drawer
  const [selectedDetail, setSelectedDetail] = useState<SqlDetailData | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Row 클릭 → API 호출
  const handleRowClick = async (row: RankData) => {
    try {
      const detail = await getSqlDetail({
        sqlId: row.sqlId,
        startDate,
        endDate: startDate,
        intervalMinutes: interval,
      });

      setSelectedDetail(detail);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Failed to load SQL detail:", error);
    }
  };

  // 정렬 상태
  const [sortConfigLeft, setSortConfigLeft] = useState<{
    key: keyof RankData;
    direction: "asc" | "desc";
  } | null>(null);

  const [sortConfigRight, setSortConfigRight] = useState<{
    key: keyof RankData;
    direction: "asc" | "desc";
  } | null>(null);

  // mock leftData / rightData (생략 — 기존 코드 그대로 사용)
  const leftData: RankData[] = [
    /* 생략 */
  ];
  const rightData: RankData[] = [
    /* 생략 */
  ];

  // 정렬 함수
  const sortData = (
    data: RankData[],
    sortConfig: { key: keyof RankData; direction: "asc" | "desc" } | null
  ) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedLeftData = useMemo(
    () => sortData(leftData, sortConfigLeft),
    [leftData, sortConfigLeft]
  );

  const sortedRightData = useMemo(
    () => sortData(rightData, sortConfigRight),
    [rightData, sortConfigRight]
  );

  // 테이블 컬럼
  const columns = [
    { key: "rank", label: "rank" },
    { key: "rankChanged", label: "rank changed" },
    { key: "ratio", label: "ratio" },
    { key: "exec", label: "execute" },
    { key: "hash", label: "hash" },
    { key: "query", label: "query" },
  ];

  // 테이블 row 변환
  const toRows = (data: RankData[]) =>
    data.map((row) => [
      row.rank,
      <span>{row.rankChanged}</span>,
      <BarGauge value={row.ratio} max={40} />,
      row.exec,
      row.sqlId,
      <span className="sql-top__query-link" onClick={() => handleRowClick(row)}>
        {row.query}
      </span>,
    ]);

  return (
    <div className="sql-top">
      {/* ------- Filter Section ------- */}
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
              options={[
                { label: "선택해주세요", value: "0" },
                { label: "Elapsed Time", value: "1" },
                { label: "Wait Time", value: "2" },
                { label: "Avg Elapsed Time", value: "3" },
                { label: "Execute Count", value: "4" },
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
            <Button text="검색" size="sm" variant="primary" />
          </div>
        </div>
      </div>

      {/* ------- Summary Chart ------- */}
      <div className="sql-top__summary">
        Summary Chart
        <LineChart
          legends={["기준 날짜", "비교 날짜"]}
          seriesData={[
            leftData.map((d) => d.exec),
            rightData.map((d) => d.exec),
          ]}
          categories={["00:00", "01:00", "02:00", "03:00", "04:00"]}
        />
      </div>

      {/* ------- Table Comparison ------- */}
      <div className="sql-top__table">
        {/* 기준 */}
        <div className="sql-top__table-block">
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-mainCircle" />
            기준 데이터
          </div>

          <TableChart
            columns={columns}
            rows={toRows(sortedLeftData)}
            sortConfig={sortConfigLeft}
            onSort={(key) =>
              setSortConfigLeft((prev) =>
                prev && prev.key === key && prev.direction === "asc"
                  ? { key: key as keyof RankData, direction: "desc" }
                  : { key: key as keyof RankData, direction: "asc" }
              )
            }
          />
        </div>

        {/* 비교 */}
        <div className="sql-top__table-block">
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-greenCircle" />
            비교 데이터
          </div>

          <TableChart
            columns={columns}
            rows={toRows(sortedRightData)}
            sortConfig={sortConfigRight}
            onSort={(key) =>
              setSortConfigRight((prev) =>
                prev && prev.key === key && prev.direction === "asc"
                  ? { key: key as keyof RankData, direction: "desc" }
                  : { key: key as keyof RankData, direction: "asc" }
              )
            }
          />
        </div>
      </div>

      {/* ------- Detail Drawer ------- */}
      {isDrawerOpen && selectedDetail && (
        <SqlDetailDrawer
          data={selectedDetail}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default SqlTop;
