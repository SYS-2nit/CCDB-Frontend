/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getSqlCompareStats,
  getSqlDetail,
  getPeriodGraph,
} from "@/api/Sql/sql";

export const fetchCompareStats = async (params: any) =>
  getSqlCompareStats(params);

export const fetchSqlDetail = async (params: any) => getSqlDetail(params);

export const fetchPeriodData = async (params: any) => getPeriodGraph(params);
