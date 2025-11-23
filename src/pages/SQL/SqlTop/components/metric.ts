import type { SqlStatsItem } from "@/api/Sql/sql";
import type { SqlFilterType } from "../../types";

// SQL 메트릭 필드 매핑과 값 계산
export const metricFieldMap: Record<SqlFilterType, keyof SqlStatsItem> = {
  elapsed: "elapsedUsDelta",
  wait: "waitTimeUsDelta",
  avg: "avgElapsed",
  execute: "executionsDelta",
  execution: "executionsDelta",
  buffer: "bufferGetsDelta",
  disk: "diskReadsDelta",
  cpu: "cpuUsDelta",
};

export const metricLabelMap: Record<SqlFilterType, string> = {
  elapsed: "Elapsed Time",
  wait: "Wait Time",
  avg: "Avg Elapsed",
  execute: "Execute Count",
  execution: "Executions",
  buffer: "Logical Reads",
  disk: "Physical Reads",
  cpu: "CPU Time",
};

export const getMetricValue = (
  item: SqlStatsItem,
  filter: SqlFilterType
): number => {
  const field = metricFieldMap[filter];
  return item[field] ?? 0;
};
