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
import LineChart from "@/components/Chart/LineChart";

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
  // 초기 날짜 계산 (어제 ~ 오늘)
  const getDefaultDateRange = () => {
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    const toString = (d: Date) => d.toISOString().split("T")[0]; // yyyy-mm-dd 형태

    return {
      start: toString(yesterday),
      end: toString(today),
    };
  };

  // 검색 조건
  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [filter, setFilter] = useState("Elapsed Time");
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
        size: 15, // 한 페이지당 갯수
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
        {/* 좌측 (시작일, 종료일, 필터, 버튼 3개) */}
        <div className="sql-stat__search-left">
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
            label="필터"
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

          <div className="sql-stat__search-left-btns">
            <Button
              text="10분"
              size="sm"
              variant="primary"
              onClick={() => fetchStats(1)}
            />
            <Button
              text="30분"
              size="sm"
              variant="primary"
              onClick={() => fetchStats(1)}
            />
            <Button
              text="1시간"
              size="sm"
              variant="primary"
              onClick={() => fetchStats(1)}
            />
          </div>
        </div>

        {/* 우측 (검색 버튼) */}
        <div className="sql-stat__search-right">
          <Button
            text="검색"
            size="sm"
            variant="primary"
            onClick={() => fetchStats(1)}
          />
        </div>
      </div>

      {/* Summary Chart */}
      <div className="sql-stat__summary">
        <div className="sql-stat__stat__summary-chart">
          Summary Chart
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
        조회 결과
        {noResult ? (
          <div className="sql-stat__table-null">검색 결과가 없습니다.</div>
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
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(page) => fetchStats(page)}
        />
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
