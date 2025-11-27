import React from "react";
import DateInput from "@/components/Input/DateInput";
import { IntervalButtons } from "../../components/IntervalButtons";
import { FilterSelect } from "../../components/FilterSelect";
import { SQL_STAT_FILTER_OPTIONS } from "../../constants";
import type { SqlFilterType, IntervalType } from "../../types";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SqlStatSearchProps {
  dateRange: {
    start: string;
    end: string;
  };
  onDateRangeChange: (field: "start" | "end", value: string) => void;
  filter: SqlFilterType | "";
  onFilterChange: (value: SqlFilterType) => void;
  interval: IntervalType;
  onIntervalChange: (value: IntervalType) => void;
}

export const SqlStatSearch: React.FC<SqlStatSearchProps> = ({
  dateRange,
  onDateRangeChange,
  filter,
  onFilterChange,
  interval,
  onIntervalChange,
}) => {
  return (
    <div className="sql-stat__search">
      <div className="sql-stat__search-left">
        <DateInput
          size="sm"
          label="시작일"
          value={dateRange.start}
          onChange={(e) => onDateRangeChange("start", e.target.value)}
        />

        <DateInput
          label="종료일"
          value={dateRange.end}
          onChange={(e) => onDateRangeChange("end", e.target.value)}
        />

        <FilterSelect
          value={filter}
          onChange={onFilterChange}
          options={SQL_STAT_FILTER_OPTIONS}
        />

        <IntervalButtons
          value={interval}
          onChange={onIntervalChange}
          className="sql-stat__search-left-btns"
        />
      </div>
    </div>
  );
};
