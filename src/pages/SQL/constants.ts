import type { SqlFilterType, IntervalType } from "./types";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

/* ===== 필터 옵션 ===== */
export interface FilterOption {
  label: string;
  value: SqlFilterType;
}

/* SqlStat에서 사용하는 필터 옵션 */
export const SQL_STAT_FILTER_OPTIONS: FilterOption[] = [
  { label: "Elapsed Time", value: "elapsed" },
  { label: "Avg Elapsed", value: "avg" },
  { label: "Wait Time", value: "wait" },
  { label: "Executions", value: "execution" },
  { label: "Logical Reads", value: "buffer" },
  { label: "Physical Reads", value: "disk" },
  { label: "CPU Time", value: "cpu" },
];

/* SqlTop에서 사용하는 필터 옵션 */
export const SQL_TOP_FILTER_OPTIONS: FilterOption[] = [
  { label: "Elapsed Time", value: "elapsed" },
  { label: "Wait Time", value: "wait" },
  { label: "Avg Elapsed", value: "avg" },
  { label: "Execute Count", value: "execute" },
];

/* ===== Interval 옵션 ===== */
export interface IntervalOption {
  label: string;
  value: IntervalType;
}

export const INTERVAL_OPTIONS: IntervalOption[] = [
  { label: "30분", value: 30 },
  { label: "1시간", value: 60 },
  { label: "2시간", value: 120 },
];

/* ===== 기본값 ===== */
export const DEFAULT_FILTER: SqlFilterType = "elapsed";
export const DEFAULT_INTERVAL: IntervalType = 30;
export const DEFAULT_PAGE_SIZE = 10;

/* ===== 테이블 관련 상수 ===== */
export const BAR_GAUGE_MAX = 50000000;
export const MIN_EXEC_COUNT = 1;
export const MAX_EXEC_COUNT = 10000;
export const PLAN_HISTORY_ROWS_PER_PAGE = 15;

/* ===== 기본 Instance ID ===== */
export const DEFAULT_INSTANCE_ID = 1;

