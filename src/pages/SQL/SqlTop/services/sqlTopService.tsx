import {
  getSqlCompareStats,
  getSqlDetail,
  getPeriodGraph,
} from "@/api/Sql/sql";
import type {
  CompareStatsParams,
  SqlDetailParams,
  PeriodGraphParams,
} from "../../types";

export const fetchCompareStats = async (params: CompareStatsParams) =>
  getSqlCompareStats(params);

export const fetchSqlDetail = async (params: SqlDetailParams) =>
  getSqlDetail(params);

export const fetchPeriodData = async (params: PeriodGraphParams) =>
  getPeriodGraph(params);
