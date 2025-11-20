import "./SqlTop.scss";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import LineChart from "@/components/Chart/LineChart";
import DateInput from "@/components/Input/DateInput";
import BarGauge from "@/components/Chart/BarGauge";
import SqlDetailDrawer from "../Modal/SqlDetailDrawer";
import Select from "@/components/Select/Select";
import Checkbox from "@/components/Checkbox/Checkbox";
import Spinner from "@/components/Spinner/Spinner";
import { useSqlTop } from "./hooks/useSqlTop";

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
      {/* 검색 UI */}
      <div className="sql-top__header">
        <div className="sql-top__search">
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
            placeholder="선택해주세요"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { label: "Elapsed Time", value: "elapsed" },
              { label: "Wait Time", value: "wait" },
              { label: "Avg Elapsed", value: "avg" },
              { label: "Execute Count", value: "execute" },
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
      </div>

      {/* 라인차트 */}
      <div className="sql-top__summary">
        <div className="sql-stat__stat__summary-chart">
          Summary Chart
          {isChartLoading ? (
            <Spinner message="차트 데이터 불러오는 중..." />
          ) : baseValues.length === 0 && compareValues.length === 0 ? (
            <div className="sql-stat__chart-null">검색 결과가 없습니다.</div>
          ) : (
            <LineChart
              legends={["기준", "비교"]}
              seriesData={[baseValues, compareValues]}
              categories={timeline}
              height={300}
            />
          )}
        </div>
      </div>

      {/* 테이블 */}
      <div className="sql-top__table">
        {/* 기준 table */}
        <div className="sql-top__table-block">
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-left">
              기준 날짜 ({startDate || "YYYY-MM-DD"})
            </div>
            <div className="sql-top__table-block-header-right"></div>
          </div>

          {baseList.length === 0 ? (
            <div className="sql-stat__table-null">검색 결과가 없습니다.</div>
          ) : (
            <TableChart
              columns={[
                { key: "check", label: "check" },
                { key: "rankChanged", label: "rank changed" },
                { key: "ratio", label: "ratio" },
                { key: "exec", label: metricLabel },
                { key: "hash", label: "SQL ID" },
                { key: "query", label: "query" },
              ]}
              rows={baseList.map((row) => [
                <Checkbox
                  size="sm"
                  checked={selectedBase === row.sqlId}
                  onChange={() =>
                    setSelectedBase(
                      selectedBase === row.sqlId ? null : row.sqlId
                    )
                  }
                />,
                row.rankChanged,
                <BarGauge value={row.ratio} />,
                row.exec,
                row.sqlId,
                <span
                  className="sql-top__query-link"
                  onClick={() => handleBaseRowClick(row)}
                >
                  {row.query}
                </span>,
              ])}
            />
          )}
        </div>

        {/* 비교 table */}
        <div className="sql-top__table-block">
          <div className="sql-top__table-block-header">
            <div className="sql-top__table-block-header-left">
              비교 날짜 ({compareDate || "YYYY-MM-DD"})
            </div>
            <div className="sql-top__table-block-header-right">
              <Button
                text="비교하기"
                size="sm"
                variant="primary"
                disabled={!selectedBase || !selectedCompare}
                onClick={fetchCompareDetails}
              />
            </div>
          </div>

          {compareList.length === 0 ? (
            <div className="sql-stat__table-null">검색 결과가 없습니다.</div>
          ) : (
            <TableChart
              columns={[
                { key: "check", label: "check" },
                { key: "ratio", label: "ratio" },
                { key: "exec", label: metricLabel },
                { key: "hash", label: "SQL ID" },
                { key: "query", label: "query" },
              ]}
              rows={compareList.map((row) => [
                <Checkbox
                  size="sm"
                  checked={selectedCompare === row.sqlId}
                  onChange={() =>
                    setSelectedCompare(
                      selectedCompare === row.sqlId ? null : row.sqlId
                    )
                  }
                />,
                <BarGauge value={row.ratio} />,
                row.exec,
                row.sqlId,
                <span
                  className="sql-top__query-link"
                  onClick={() => handleCompareRowClick(row)}
                >
                  {row.query}
                </span>,
              ])}
            />
          )}
        </div>
      </div>

      {/* 상세 탭 */}
      {isDrawerOpen && detailData && (
        <SqlDetailDrawer data={detailData} onClose={closeDrawer} />
      )}
    </div>
  );
};

export default SqlTop;
