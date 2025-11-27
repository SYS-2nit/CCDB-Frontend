import "./SqlTop.scss";
import SqlDetailDrawer from "../Modal/SqlDetailDrawer";
import { useSqlTop } from "./hooks/useSqlTop";
import { SqlTopSearch } from "./components/SqlTopSearch";
import { SqlTopChart } from "./components/SqlTopChart";
import { SqlTopTable } from "./components/SqlTopTable";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

const SqlTop = () => {
  const {
    startDate,
    compareDate,
    setStartDate,
    setCompareDate,
    filter,
    setFilter,
    interval,
    setInterval,
    metricLabel,
    baseList,
    compareList,
    timeline,
    baseValues,
    compareValues,
    isChartLoading,
    isTableLoading,
    selectedBase,
    selectedCompare,
    setSelectedBase,
    setSelectedCompare,
    handleBaseRowClick,
    handleCompareRowClick,
    fetchCompareDetails,
    isDrawerOpen,
    detailData,
    closeDrawer,
  } = useSqlTop();

  return (
    <div className="sql-top">
      <SqlTopSearch
        startDate={startDate}
        onStartDateChange={setStartDate}
        compareDate={compareDate}
        onCompareDateChange={setCompareDate}
        filter={filter}
        onFilterChange={setFilter}
        interval={interval}
        onIntervalChange={setInterval}
      />

      <SqlTopChart
        baseValues={baseValues}
        compareValues={compareValues}
        timeline={timeline}
        isChartLoading={isChartLoading}
      />

      <div className="sql-top__table">
        <SqlTopTable
          date={`기준 날짜 (${startDate || "YYYY-MM-DD"})`}
          list={baseList}
          isTableLoading={isTableLoading}
          metricLabel={metricLabel}
          selectedSqlId={selectedBase}
          onSelectChange={setSelectedBase}
          onRowClick={handleBaseRowClick}
          showRankChanged={true}
        />

        <SqlTopTable
          date={`비교 날짜 (${compareDate || "YYYY-MM-DD"})`}
          list={compareList}
          isTableLoading={isTableLoading}
          metricLabel={metricLabel}
          selectedSqlId={selectedCompare}
          onSelectChange={setSelectedCompare}
          onRowClick={handleCompareRowClick}
          showCompareButton={true}
          onCompareClick={fetchCompareDetails}
          isCompareDisabled={!selectedBase || !selectedCompare}
        />
      </div>

      {isDrawerOpen && detailData && (
        <SqlDetailDrawer data={detailData} onClose={closeDrawer} />
      )}
    </div>
  );
};

export default SqlTop;
