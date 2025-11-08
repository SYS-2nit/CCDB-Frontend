/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo } from "react";
import "./SqlStat.scss";
import DateInput from "@/components/Input/DateInput";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import SearchIcon from "@/assets/general/search.svg";
import TableChart from "@/components/Chart/TableChart";
import BarGauge from "@/components/Chart/BarGauge";
import Pagination from "@/components/Pagination/Pagination";
import SqlDetailDrawer from "../Modal/SqlDetailDrawer";
import LineChart from "@/components/Chart/LineChart";
import Select from "@/components/Select/Select";

interface TableData {
  sql: string;
  elapsed: number;
  wait: number;
  avg: number;
  max: number;
  exec: number;
  logical: number;
  physical: number;
  block: number;
  parse: number;
}

const SqlStat: React.FC = () => {
  const [date, setDate] = useState("");
  const [queryCount, setQueryCount] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableData;
    direction: "asc" | "desc";
  } | null>(null);

  // Drawer 상태
  const [selectedRow, setSelectedRow] = useState<TableData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 원본 데이터
  const data: TableData[] = [
    {
      sql: "update sys.user$",
      elapsed: 1,
      wait: 0,
      avg: 1,
      max: 1,
      exec: 1,
      logical: 0,
      physical: 0,
      block: 0,
      parse: 0,
    },
    {
      sql: "select /*+ conn */",
      elapsed: 0,
      wait: 0,
      avg: 0,
      max: 0,
      exec: 1,
      logical: 0,
      physical: 0,
      block: 0,
      parse: 0,
    },
    {
      sql: "SELECT SEQ_CURRVAL",
      elapsed: 0,
      wait: 0,
      avg: 0,
      max: 0,
      exec: 1,
      logical: 21,
      physical: 0,
      block: 4,
      parse: 0,
    },
    {
      sql: "SELECT CONFIG",
      elapsed: 0,
      wait: 0,
      avg: 0,
      max: 0,
      exec: 26,
      logical: 59883,
      physical: 0,
      block: 28023,
      parse: 0,
    },
    {
      sql: "INSERT INTO CUSTOMERS",
      elapsed: 0,
      wait: 0,
      avg: 0,
      max: 0,
      exec: 2,
      logical: 0,
      physical: 0,
      block: 0,
      parse: 0,
    },
  ];

  // 정렬 핸들러
  const handleSort = (key: keyof TableData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // 정렬된 데이터 계산
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // 컬럼 정의
  const columns = [
    { key: "sql", label: "SQL Text" },
    { key: "elapsed", label: "Elapsed Time" },
    { key: "wait", label: "Wait Time" },
    { key: "avg", label: "Avg Elapsed Time" },
    { key: "max", label: "Max Elapsed Time" },
    { key: "exec", label: "Execute Count" },
    { key: "logical", label: "Logical Reads" },
    { key: "physical", label: "Physical Reads" },
    { key: "block", label: "Block Changes" },
    { key: "parse", label: "Hard Parses" },
  ];

  // 행 구성 + 클릭 이벤트 추가
  const rows = sortedData.map((row) => [
    <span
      className="sql-stat__sql-text sql-stat__sql-clickable"
      onClick={() => {
        setSelectedRow(row);
        setIsDrawerOpen(true);
      }}
    >
      {row.sql}
    </span>,
    <BarGauge value={row.elapsed} max={2} />,
    <BarGauge value={row.wait} max={2} />,
    <BarGauge value={row.avg} max={2} />,
    <BarGauge value={row.max} max={2} />,
    <BarGauge value={row.exec} max={30} />,
    <BarGauge value={row.logical} max={60000} />,
    <BarGauge value={row.physical} max={10} />,
    <BarGauge value={row.block} max={30000} />,
    <BarGauge value={row.parse} max={5} />,
  ]);

  return (
    <div className="sql-stat">
      {/* 검색 영역 */}
      <div className="sql-stat__search">
        {/* 왼쪽 (기간 + 필터) */}
        <div className="sql-stat__search-left">
          <DateInput
            label="기준 날짜"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
        </div>

        {/* 오른쪽 (검색 + 버튼) */}
        <div className="sql-stat__search-right">
          <Input
            icon={SearchIcon}
            placeholder="조회 건수를 입력해주세요."
            value={queryCount}
            onChange={(e) => setQueryCount(e.target.value)}
          />
          <Button
            text="검색"
            size="sm"
            variant="primary"
            onClick={() => console.log("검색")}
          />
        </div>
      </div>

      {/* Summary Chart */}
      <div className="sql-top__summary">
        <div className="sql-top__chart">
          <LineChart
            legends={["기준 날짜"]}
            seriesData={[
              [
                8, 10, 12, 11, 9, 10, 8, 9, 11, 13, 12, 10, 9, 10, 11, 12, 13,
                12, 11, 9, 8, 10, 9, 11,
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

      {/* 테이블 영역 */}
      <div className="sql-stat__table">
        <div className="sql-stat__table-title">조회 결과</div>
        <TableChart
          columns={columns}
          rows={rows}
          sortable
          sortConfig={
            sortConfig
              ? { key: sortConfig.key, direction: sortConfig.direction }
              : null
          }
          onSort={(key) => handleSort(key as keyof TableData)}
          size="lg"
        />
      </div>

      {/* SQL 상세 모달 */}
      {isDrawerOpen && selectedRow && (
        <SqlDetailDrawer
          data={{
            query: selectedRow.sql,
            rank: 1,
            ratio: selectedRow.avg,
            exec: selectedRow.exec,
          }}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* 페이지네이션 */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default SqlStat;
