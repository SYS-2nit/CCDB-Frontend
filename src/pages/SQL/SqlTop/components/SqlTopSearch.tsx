import React from "react";
import DateInput from "@/components/Input/DateInput";
import { IntervalButtons } from "../../components/IntervalButtons";
import { FilterSelect } from "../../components/FilterSelect";
import { SQL_TOP_FILTER_OPTIONS } from "../../constants";
import type { SqlFilterType, IntervalType } from "../../types";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SqlTopSearchProps {
  startDate: string;
  onStartDateChange: (value: string) => void;
  compareDate: string;
  onCompareDateChange: (value: string) => void;
  filter: SqlFilterType | "";
  onFilterChange: (value: SqlFilterType) => void;
  interval: IntervalType;
  onIntervalChange: (value: IntervalType) => void;
}

export const SqlTopSearch: React.FC<SqlTopSearchProps> = ({
  startDate,
  onStartDateChange,
  compareDate,
  onCompareDateChange,
  filter,
  onFilterChange,
  interval,
  onIntervalChange,
}) => {
  return (
    <div className="sql-top__header">
      <div className="sql-top__search">
        <DateInput
          label="기준 날짜"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />

        <DateInput
          label="비교 날짜"
          value={compareDate}
          onChange={(e) => onCompareDateChange(e.target.value)}
        />

        <FilterSelect
          value={filter}
          onChange={onFilterChange}
          options={SQL_TOP_FILTER_OPTIONS}
          placeholder="선택해주세요"
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

