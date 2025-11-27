import React from "react";
import "./SqlStat.scss";
import SqlDetailDrawer from "@/pages/SQL/Modal/SqlDetailDrawer";
import { useSqlStat } from "./hooks/useSqlStat";
import { SqlStatSearch } from "./components/SqlStatSearch";
import { SqlStatChart } from "./components/SqlStatChart";
import { SqlStatTable } from "./components/SqlStatTable";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

const SqlStat: React.FC = () => {
  const {
    dateRange,
    setDateRange,
    filter,
    setFilter,
    interval,
    setInterval,
    graphData,
    sortedData,
    isGraphLoading,
    isTableLoading,
    noResult,
    sortConfig,
    currentPage,
    totalPages,
    setCurrentPage,
    detailData,
    isDrawerOpen,
    handleSort,
    handleRowClick,
    closeDrawer,
  } = useSqlStat();

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="sql-stat">
      <SqlStatSearch
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        filter={filter}
        onFilterChange={setFilter}
        interval={interval}
        onIntervalChange={setInterval}
      />

      <SqlStatChart
        graphData={graphData}
        isGraphLoading={isGraphLoading}
        filter={filter}
        dateRange={dateRange}
      />

      <SqlStatTable
        sortedData={sortedData}
        isTableLoading={isTableLoading}
        noResult={noResult}
        sortConfig={sortConfig}
        onSort={handleSort}
        onRowClick={handleRowClick}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {isDrawerOpen && detailData && (
        <SqlDetailDrawer data={detailData} onClose={closeDrawer} />
      )}
    </div>
  );
};

export default SqlStat;
