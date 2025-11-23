import type { SqlStatsItem, SqlDetailItem, PlanHistoryItem } from "@/api/Sql/sql";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";

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
  beforePlanText?: string;
  afterPlanText?: string;
}

/* ===== SqlDetailDrawer에서 사용하는 타입 ===== */
export type SqlDetailDrawerData = SqlDetailData & {
  date?: string;
};

