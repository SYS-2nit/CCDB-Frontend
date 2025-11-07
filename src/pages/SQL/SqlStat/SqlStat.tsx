import React, { useState, useMemo } from "react";
import "./SqlStat.scss";
import DateInput from "@/components/Input/DateInput";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import SearchIcon from "@/assets/general/search.svg";
import TableChart from "@/components/Chart/TableChart";
import BarGauge from "@/components/Chart/BarGauge";
import Pagination from "@/components/Pagination/Pagination";

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
  const totalPages = 5;
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableData;
    direction: "asc" | "desc";
  } | null>(null);

  // 원본 데이터
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 행 구성
  const rows = sortedData.map((row) => [
    <span className="sql-stat__sql-text">{row.sql}</span>,
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
        <DateInput
          label="기간"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="조회 검색"
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

      {/* 테이블 영역 */}
      <div className="sql-stat__table">
        <h3>조회 결과</h3>
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
