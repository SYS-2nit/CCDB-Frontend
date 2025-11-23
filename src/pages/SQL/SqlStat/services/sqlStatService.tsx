import {
  getSqlDetail,
  getSqlGraph,
  getSqlStats,
  type SqlGraphParams,
} from "@/api/Sql/sql";
import type {
  SqlStatsParams,
  SqlDetailParams,
} from "../../types";

export const fetchSqlGraph = async (params: SqlGraphParams) =>
  getSqlGraph(params);

export const fetchSqlStats = async (params: SqlStatsParams) =>
  getSqlStats(params);

export const fetchSqlDetail = async (params: SqlDetailParams) =>
  getSqlDetail(params);

