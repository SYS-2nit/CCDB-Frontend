import React, { useState, useMemo, useEffect } from "react";
import "./SqlStat.scss";
import DateInput from "@/components/Input/DateInput";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import BarGauge from "@/components/Chart/BarGauge";
import Pagination from "@/components/Pagination/Pagination";
import SqlDetailDrawer from "../Modal/SqlDetailDrawer";
import LineChart from "@/components/Chart/LineChart";
import Select from "@/components/Select/Select";
import { getSqlList, type SqlResponse } from "@/api/Sql/sql";

interface TableData {
  sql: string;
  elapsed: number;
  wait: number;
  avg: number;
  exec: number;
  logical: number;
  physical: number;
  cpu: number;
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

  const [tableData, setTableData] = useState<TableData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedRow, setSelectedRow] = useState<TableData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 백엔드 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sqlList: SqlResponse[] = await getSqlList();

        // TableData 형태로 매핑
        const mapped: TableData[] = sqlList.map((item) => ({
          sql: item.field3,
          elapsed: Math.floor(Math.random() * 5),
          wait: Math.floor(Math.random() * 5),
          avg: Math.floor(Math.random() * 3),
          max: Math.floor(Math.random() * 3),
          exec: Math.floor(Math.random() * 10),
          logical: Math.floor(Math.random() * 60000),
          physical: Math.floor(Math.random() * 1000),
          cpu: Math.floor(Math.random() * 30000),
        }));

        setTableData(mapped);
      } catch (err) {
        console.error("❌ SQL 리스트 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 정렬
  const handleSort = (key: keyof TableData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return tableData;
    return [...tableData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [tableData, sortConfig]);

  const columns = [
    { key: "sql", label: "SQL Text" },
    { key: "elapsed", label: "Elapsed Time" },
    { key: "wait", label: "Wait Time" },
    { key: "avg", label: "Avg Elapsed Time" },
    { key: "exec", label: "Execute Count" },
    { key: "logical", label: "Logical Reads" },
    { key: "physical", label: "Physical Reads" },
    { key: "cpu", label: "CPU Time" },
  ];

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
    <BarGauge value={row.elapsed} max={5} />,
    <BarGauge value={row.wait} max={5} />,
    <BarGauge value={row.avg} max={5} />,
    <BarGauge value={row.exec} max={30} />,
    <BarGauge value={row.logical} max={60000} />,
    <BarGauge value={row.physical} max={1000} />,
    <BarGauge value={row.cpu} max={30000} />,
  ]);

  if (isLoading) return <div className="sql-stat__loading">로딩 중...</div>;

  return (
    <div className="sql-stat">
      {/* 검색 영역 */}
      <div className="sql-stat__search">
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
            { label: "cpu Time", value: "7" },
          ]}
        />

        <Input
          label="조회 건수"
          size="sm"
          type="number"
          placeholder="0"
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

      {/* 테이블 */}
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

      {/* SQL 상세 Drawer */}
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
