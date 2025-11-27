import React from "react";
import LineChart from "@/components/Chart/LineChart";
import Spinner from "@/components/Spinner/Spinner";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SqlTopChartProps {
  baseValues: number[];
  compareValues: number[];
  timeline: string[];
  isChartLoading: boolean;
}

export const SqlTopChart: React.FC<SqlTopChartProps> = ({
  baseValues,
  compareValues,
  timeline,
  isChartLoading,
}) => {
  return (
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
            height={200}
          />
        )}
      </div>
    </div>
  );
};
