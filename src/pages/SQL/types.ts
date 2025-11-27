import type { PlanHistoryItem } from "@/api/Sql/sql";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

/* ===== SQL 필터 타입 ===== */
export type SqlFilterType = 
  | "elapsed" 
  | "avg" 
  | "wait" 
  | "execution" 
  | "buffer" 
  | "disk" 
  | "cpu"
  | "execute";

/* ===== Interval 타입 ===== */
export type IntervalType = 30 | 60 | 120;

/* ===== Graph Bucket 타입 ===== */
export interface GraphBucket {
  timeLabel: string;
  value: number;
}

export interface SqlGraphResponse {
  buckets: GraphBucket[];
}

/* ===== Period Graph Item 타입 ===== */
export interface PeriodGraphItem {
  datetime: string;
  value: number;
}

/* ===== SQL 통계 파라미터 타입 ===== */
export interface SqlStatsParams {
  instanceId: number;
  startDate: string;
  endDate: string;
  keyword?: string;
  minExecCount?: number;
  maxExecCount?: number;
  orderBy?: string;
  direction?: "ASC" | "DESC";
  page?: number;
  size?: number;
}

/* ===== SQL 상세 파라미터 타입 ===== */
export interface SqlDetailParams {
  sqlId: string;
  startDate: string;
  endDate: string;
  intervalMinutes: number;
}

/* ===== Compare Stats 파라미터 타입 ===== */
export interface CompareStatsParams {
  baseDate: string;
  compareDate: string;
  instanceId: number;
  keyword?: string;
  intervalMinutes?: number;
}

/* ===== Period Graph 파라미터 타입 ===== */
export interface PeriodGraphParams {
  startDate: string;
  endDate: string;
  metric: string;
  intervalMinutes: number;
  instanceId: number;
}

/* ===== Plan History Row 타입 ===== */
export interface PlanHistoryRow extends PlanHistoryItem {
  beforePlanText?: string | null;
  afterPlanText?: string | null;
}

/* ===== SqlDetailDrawer에서 사용하는 타입 ===== */
export type SqlDetailDrawerData = SqlDetailData & {
  date?: string;
};

