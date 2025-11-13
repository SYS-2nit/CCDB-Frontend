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

interface RankData {
  rank: number;
  rankChanged: string;
  ratio: number;
  exec: number;
  hash: number;
  query: string;
}

const SqlTop: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [compareDate, setCompareDate] = useState("");

  // 상세 모달 상태
  const [selectedRow, setSelectedRow] = useState<RankData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRowClick = (row: RankData) => {
    setSelectedRow(row);
    setIsDrawerOpen(true);
  };

  // 각각 테이블별 정렬 상태
  const [sortConfigLeft, setSortConfigLeft] = useState<{
    key: keyof RankData;
    direction: "asc" | "desc";
  } | null>(null);
  const [sortConfigRight, setSortConfigRight] = useState<{
    key: keyof RankData;
    direction: "asc" | "desc";
  } | null>(null);

  // 좌측 데이터
  const leftData: RankData[] = [
    {
      rank: 1,
      rankChanged: "-",
      ratio: 32.4,
      exec: 487,
      hash: 129355838,
      query: "WITH l AS",
    },
    {
      rank: 2,
      rankChanged: "-",
      ratio: 17.8,
      exec: 267,
      hash: -1949852335,
      query: "SELECT count(*) FROM rental",
    },
    {
      rank: 3,
      rankChanged: "▲ 1",
      ratio: 10.9,
      exec: 163,
      hash: 2116116256,
      query: "SELECT null",
    },
    {
      rank: 4,
      rankChanged: "▲ 3",
      ratio: 9.7,
      exec: 146,
      hash: 865086046,
      query: "WITH freeze...",
    },
    {
      rank: 5,
      rankChanged: "▼ -2",
      ratio: 8.3,
      exec: 124,
      hash: 18372298,
      query: "SELECT pid, ...",
    },
    {
      rank: 6,
      rankChanged: "-",
      ratio: 5.9,
      exec: 89,
      hash: -187329398,
      query: "autovacuum",
    },
    {
      rank: 7,
      rankChanged: "▼ -2",
      ratio: 5.9,
      exec: 89,
      hash: 1279292926,
      query: "/*insert into*/",
    },
    {
      rank: 8,
      rankChanged: "new",
      ratio: 3.3,
      exec: 50,
      hash: -1943408597,
      query: "SELECT /*+ ... */",
    },
    {
      rank: 9,
      rankChanged: "new",
      ratio: 3.1,
      exec: 46,
      hash: 113075308,
      query: "SELECT date",
    },
    {
      rank: 10,
      rankChanged: "new",
      ratio: 2.7,
      exec: 41,
      hash: 138917704,
      query: "SELECT config",
    },
  ];

  // 우측 데이터
  const rightData: RankData[] = [
    {
      rank: 1,
      rankChanged: "-",
      ratio: 32.8,
      exec: 455,
      hash: 129355838,
      query: "WITH l AS (SELECT ...)",
    },
    {
      rank: 2,
      rankChanged: "-",
      ratio: 19.2,
      exec: 267,
      hash: -1949852335,
      query: "SELECT count(*) FROM rental",
    },
    {
      rank: 3,
      rankChanged: "-",
      ratio: 12.8,
      exec: 177,
      hash: 18372298,
      query: "SELECT pid, username, client",
    },
    {
      rank: 4,
      rankChanged: "-",
      ratio: 9.7,
      exec: 135,
      hash: 2116116256,
      query: "SELECT null, round(pg_wal_lsn_diff)",
    },
    {
      rank: 5,
      rankChanged: "-",
      ratio: 6.4,
      exec: 89,
      hash: 1279292926,
      query: "/*insert into rental_copy*/",
    },
    {
      rank: 6,
      rankChanged: "-",
      ratio: 6.4,
      exec: 67,
      hash: 865086046,
      query: "WITH freeze_max_age AS (...)",
    },
    {
      rank: 7,
      rankChanged: "-",
      ratio: 4.8,
      exec: 46,
      hash: 658956678,
      query: "SELECT /* WHATAP */ datname",
    },
    {
      rank: 8,
      rankChanged: "-",
      ratio: 3.3,
      exec: 33,
      hash: 1123292967,
      query: "SET statement_timeout",
    },
    {
      rank: 9,
      rankChanged: "-",
      ratio: 2.4,
      exec: 30,
      hash: -1915660379,
      query: "BEGIN",
    },
    {
      rank: 10,
      rankChanged: "-",
      ratio: 2.2,
      exec: 19,
      hash: 1123292967,
      query: "END TRANSACTION",
    },
  ];

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

  const columns = [
    { key: "rank", label: "rank" },
    { key: "rankChanged", label: "rank changed" },
    { key: "ratio", label: "ratio" },
    { key: "exec", label: "execute count" },
    { key: "hash", label: "query hash" },
    { key: "query", label: "query" },
  ];

  const toRows = (data: RankData[]) =>
    data.map((row) => [
      row.rank,
      <span>{row.rankChanged}</span>,
      <BarGauge value={row.ratio} max={40} />,
      row.exec,
      row.hash,
      <span className="sql-top__query-link" onClick={() => handleRowClick(row)}>
        {row.query}
      </span>,
    ]);

  return (
    <div className="sql-top">
      {/* 필터 영역 */}
      <div className="sql-top__header">
        <div className="sql-top__search">
          {/* 왼쪽 (기준 닐짜 + 비교 날짜 + 필터) */}
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
                { label: "Logical Reads", value: "5" },
                { label: "Physical Reads", value: "6" },
                { label: "Block Changes", value: "7" },
              ]}
            />
            <div className="sql-stat__search-left-btns">
              <Button
                text="10분"
                size="sm"
                variant="primary"
                onClick={() => alert("10분 버튼 클릭")}
              />
              <Button
                text="30분"
                size="sm"
                variant="primary"
                onClick={() => alert("30분 버튼 클릭")}
              />
              <Button
                text="1시간"
                size="sm"
                variant="primary"
                onClick={() => alert("1시간 버튼 클릭")}
              />
            </div>
          </div>

          {/* 우측 (검색 버튼) */}
          <div className="sql-stat__search-right">
            <Button
              text="검색"
              size="sm"
              variant="primary"
              onClick={() => alert("검색 버튼을 클릭하였습니다.")}
            />
          </div>
        </div>
      </div>

      {/* Summary Chart */}
      <div className="sql-top__summary">
        <div className="sql-top__chart">
          <LineChart
            legends={["기준 날짜", "비교 날짜"]}
            seriesData={[
              [
                8, 10, 12, 11, 9, 10, 8, 9, 11, 13, 12, 10, 9, 10, 11, 12, 13,
                12, 11, 9, 8, 10, 9, 11,
              ],
              [
                15, 18, 22, 20, 16, 18, 15, 17, 19, 21, 23, 20, 18, 19, 21, 22,
                20, 19, 18, 17, 15, 16, 18, 17,
              ],
            ]}
            categories={[
              "00:00",
              "01:00",
              "02:00",
              "03:00",
              "04:00",
              "05:00",
              "06:00",
              "07:00",
              "08:00",
              "09:00",
              "10:00",
              "11:00",
              "12:00",
              "13:00",
              "14:00",
              "15:00",
              "16:00",
              "17:00",
              "18:00",
              "19:00",
              "20:00",
              "21:00",
              "22:00",
              "23:00",
            ]}
          />
        </div>
      </div>

      {/* 테이블 비교 */}
      <div className="sql-top__table">
        {/* 기준 테이블 영역*/}
        <div className="sql-top__table-block">
          {/* 헤더 */}
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-mainCircle"></div>
            기준: 024/05/16 00:00 ~ 2024/05/16 23:59
          </div>

          {/* 테이블  */}
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

        {/* 비교 테이블 */}
        <div className="sql-top__table-block">
          {/* 헤더 */}
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-greenCircle" />
            비교: 2024/05/09 00:00 ~ 2024/05/09 23:59
          </div>
          <TableChart
            columns={columns}
            rows={toRows(sortedRightData)}
            sortable
            sortConfig={sortConfigRight}
            onSort={(key) =>
              setSortConfigRight((prev) =>
                prev && prev.key === key && prev.direction === "asc"
                  ? { key: key as keyof RankData, direction: "desc" }
                  : { key: key as keyof RankData, direction: "asc" }
              )
            }
            size="lg"
          />
        </div>
      </div>

      {/* 상세 모달 */}
      {isDrawerOpen && selectedRow && (
        <SqlDetailDrawer
          data={selectedRow}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default SqlTop;
