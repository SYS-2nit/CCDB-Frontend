import React from "react";
import TableChart from "@/components/Chart/TableChart";
import BarGauge from "@/components/Chart/BarGauge";
import Pagination from "@/components/Pagination/Pagination";
import Spinner from "@/components/Spinner/Spinner";
import type { TableData, SortConfig } from "../hooks/useSqlStat";
import { BAR_GAUGE_MAX } from "../../constants";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SqlStatTableProps {
  sortedData: TableData[];
  isTableLoading: boolean;
  noResult: boolean;
  sortConfig: SortConfig | null;
  onSort: (key: keyof TableData) => void;
  onRowClick: (row: TableData) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const SqlStatTable: React.FC<SqlStatTableProps> = ({
  sortedData,
  isTableLoading,
  noResult,
  sortConfig,
  onSort,
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const columns = [
    { key: "sql", label: "SQL Text" },
    { key: "elapsed", label: "Elapsed Time" },
    { key: "avg", label: "Avg Elapsed" },
    { key: "wait", label: "Wait Time" },
    { key: "execution", label: "Executions" },
    { key: "buffer", label: "Logical Reads" },
    { key: "disk", label: "Physical Reads" },
    { key: "cpu", label: "CPU Time" },
  ];

  const rows = sortedData.map((row) => [
    <span
      key={`sql-${row.id}`}
      className="sql-stat__sql-text sql-stat__sql-clickable"
      onClick={() => onRowClick(row)}
    >
      {row.sql}
    </span>,

    <BarGauge
      key={`elapsed-${row.id}`}
      value={row.elapsed}
      max={BAR_GAUGE_MAX}
      showPercentage={false}
      isTime={true}
    />,
    <BarGauge
      key={`avg-${row.id}`}
      value={row.avg}
      max={BAR_GAUGE_MAX}
      showPercentage={false}
      isTime={true}
    />,
    <BarGauge
      key={`wait-${row.id}`}
      value={row.wait}
      max={BAR_GAUGE_MAX}
      showPercentage={false}
      isTime={true}
    />,
    <BarGauge
      key={`execution-${row.id}`}
      value={row.execution}
      max={BAR_GAUGE_MAX}
      showPercentage={false}
    />,
    <BarGauge
      key={`buffer-${row.id}`}
      value={row.buffer}
      max={BAR_GAUGE_MAX}
      showPercentage={false}
    />,
    <BarGauge
      key={`disk-${row.id}`}
      value={row.disk}
      max={BAR_GAUGE_MAX}
      showPercentage={false}
    />,
    <BarGauge
      key={`cpu-${row.id}`}
      value={row.cpu}
      max={BAR_GAUGE_MAX}
      showPercentage={false}
      isTime={true}
    />,
  ]);

  return (
    <div className="sql-stat__table">
      <div className="sql-stat__table-header">조회 결과</div>
      <div className="sql-stat__table-content">
        {isTableLoading ? (
          <div className="sql-stat__spinner-wrapper">
            <Spinner message="테이블 데이터 불러오는 중..." />
          </div>
        ) : noResult || sortedData.length === 0 ? (
          <div className="sql-stat__table-null">검색 결과가 없습니다.</div>
        ) : (
          <div className="sql-stat__table-wrapper">
            <TableChart
              columns={columns}
              rows={rows}
              sortable
              sortConfig={sortConfig}
              onSort={(key) => onSort(key as keyof TableData)}
            />
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

