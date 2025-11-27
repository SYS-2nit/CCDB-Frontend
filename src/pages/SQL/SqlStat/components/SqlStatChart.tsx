import React from "react";
import LineChart from "@/components/Chart/LineChart";
import Spinner from "@/components/Spinner/Spinner";
import type { GraphData } from "../hooks/useSqlStat";
import type { SqlFilterType } from "../../types";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SqlStatChartProps {
  graphData: GraphData;
  isGraphLoading: boolean;
  filter: SqlFilterType | "";
  dateRange: {
    start: string;
    end: string;
  };
}

export const SqlStatChart: React.FC<SqlStatChartProps> = ({
  graphData,
  isGraphLoading,
  filter,
  dateRange,
}) => {
  const getXAxisFilter = () => {
    if (!dateRange.start || !dateRange.end) return () => true;

    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 2) {
      // 하루 이하: 모든 레이블 표시
      return () => true;
    } else if (diffDays >= 2) {
      // 이틀 이상: 3시간 단위로 필터링 (0시, 3시, 6시, 9시, 12시, 15시, 18시, 21시)
      return (_index: number, time: string) => {
        const d = new Date(time);
        const hour = d.getHours();
        const minute = d.getMinutes();
        // 정확히 0, 3, 6, 9, 12, 15, 18, 21시이고 분이 0인 경우만 표시
        const allowedHours = [0, 3, 6, 9, 12, 15, 18, 21];
        return allowedHours.includes(hour) && minute === 0;
      };
    }
    return () => true;
  };

  return (
    <div className="sql-stat__summary">
      <div className="sql-stat__stat__summary-chart">
        Summary Chart
        {isGraphLoading ? (
          <div className="sql-stat__spinner-wrapper">
            <Spinner message="차트 데이터 불러오는 중..." />
          </div>
        ) : graphData.values.length === 0 ? (
          <div className="sql-stat__chart-null">검색 결과가 없습니다.</div>
        ) : (
          <LineChart
            legends={[`${filter || "Elapsed Time"} Trend`]}
            seriesData={[graphData.values]}
            categories={graphData.labels}
            originalTimes={graphData.originalTimes}
            xAxisFilter={getXAxisFilter()}
            height={200}
          />
        )}
      </div>
    </div>
  );
};
