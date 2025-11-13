import React, { useState, useMemo, useEffect } from "react";
import "./SqlStat.scss";
import DateInput from "@/components/Input/DateInput";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import BarGauge from "@/components/Chart/BarGauge";
import Pagination from "@/components/Pagination/Pagination";
import Select from "@/components/Select/Select";
import { getSqlStats } from "@/api/Sql/stats";
import SqlDetailDrawer from "@/pages/SQL/Modal/SqlDetailDrawer";

interface TableData {
  sql: string;
  elapsed: number;
  avg: number;
  wait: number;
  execution: number;
  cpu: number;
  buffer: number;
  disk: number;
}

const SqlStat: React.FC = () => {
  // 검색 조건
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 데이터 상태
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const [selectedRow, setSelectedRow] = useState<TableData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 게이지바 max
  const [maxValues, setMaxValues] = useState({
    elapsed: 1,
    avg: 1,
    wait: 1,
    execution: 1,
    buffer: 1,
    disk: 1,
    cpu: 1,
  });

  // 정렬
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableData;
    direction: "asc" | "desc";
  } | null>(null);

  // 검색 함수
  const fetchStats = async (page = 1) => {
    if (!dateRange.start || !dateRange.end) {
      alert("조회 기간을 설정해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setNoResult(false);

      // API 호출
      const data = await getSqlStats({
        instanceId: 1,
        startDate: dateRange.start,
        endDate: dateRange.end,
        keyword: "",
        minExecCount: 1,
        maxExecCount: 1000,
        orderBy: filter,
        direction: "DESC",
        page: page - 1,
      });

      if (data.content.length === 0) {
        setNoResult(true);
        setTableData([]);
        return;
      }

      // 데이터 매핑
      const mapped = data.content.map((item) => ({
        sql: item.sqlText,
        elapsed: item.elapsedUsDelta,
        avg: item.avgElapsed,
        wait: item.waitTimeUsDelta,
        execution: item.executionsDelta,
        buffer: item.bufferGetsDelta,
        disk: item.diskReadsDelta,
        cpu: item.cpuUsDelta,
      }));

      // 각 컬럼별 총합
      const totals = mapped.reduce(
        (acc, cur) => {
          acc.elapsed += cur.elapsed;
          acc.avg += cur.avg;
          acc.wait += cur.wait;
          acc.execution += cur.execution;
          acc.buffer += cur.buffer;
          acc.disk += cur.disk;
          acc.cpu += cur.cpu;
          return acc;
        },
        {
          elapsed: 0,
          avg: 0,
          wait: 0,
          execution: 0,
          buffer: 0,
          disk: 0,
          cpu: 0,
        }
      );

      setMaxValues(totals);
      setTableData(mapped);
      setTotalPages(data.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error("SQL 통계 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 변경 시 자동 조회
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchStats(currentPage);
    }
  }, [currentPage]);

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
    { key: "avg", label: "Avg Elapsed" },
    { key: "wait", label: "Wait Time" },
    { key: "exec", label: "Executions" },
    { key: "buffer", label: "Logical Reads" },
    { key: "disk", label: "Physical Reads" },
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
    <BarGauge value={row.elapsed} max={maxValues.elapsed || 1} />,
    <BarGauge value={row.avg} max={maxValues.avg || 1} />,
    <BarGauge value={row.wait} max={maxValues.wait || 1} />,
    <BarGauge value={row.execution} max={maxValues.execution || 1} />,
    <BarGauge value={row.buffer} max={maxValues.buffer || 1} />,
    <BarGauge value={row.disk} max={maxValues.disk || 1} />,
    <BarGauge value={row.cpu} max={maxValues.cpu || 1} />,
  ]);

  // 로딩증일 경우
  if (isLoading)
    return (
      <div className="sql-stat__loading">데이터를 불러오는 중입니다...</div>
    );

  return (
    <div className="sql-stat">
      {/* 검색 영역 */}
      <div className="sql-stat__search">
        <DateInput
          label="시작일"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, start: e.target.value }))
          }
        />
        <DateInput
          label="종료일"
          value={dateRange.end}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, end: e.target.value }))
          }
        />

        <Select
          label="정렬 기준"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { label: "Elapsed Time", value: "elapsed" },
            { label: "Avg Elapsed", value: "avg" },
            { label: "Wait Time", value: "wait" },
            { label: "Executions", value: "execution" },
            { label: "Logical Read", value: "buffer" },
            { label: "Physical Reads", value: "disk" },
            { label: "CPU Time", value: "cpu" },
          ]}
        />

        <Button
          text="검색"
          size="sm"
          variant="primary"
          onClick={() => fetchStats(1)}
        />
      </div>

      {/* 테이블 */}
      <div className="sql-stat__table">
        <div className="sql-stat__table-title">조회 결과</div>
        {noResult ? (
          <div className="sql-stat__no-result">검색 결과가 없습니다.</div>
        ) : (
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
        )}
      </div>

      {/* SQL 상세 Drawer */}
      {isDrawerOpen && selectedRow && (
        <SqlDetailDrawer
          data={{
            query: selectedRow.sql,
            rank: 1,
            ratio: selectedRow.elapsed,
            exec: selectedRow.execution,
          }}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* 페이지네이션 */}
      {!noResult && totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => fetchStats(page)}
        />
      )}
    </div>
  );
};

export default SqlStat;
