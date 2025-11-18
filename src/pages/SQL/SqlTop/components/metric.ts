/* eslint-disable @typescript-eslint/no-explicit-any */

// SQL 메트릭 필드 매핑과 값 계산
export const metricFieldMap: Record<string, string> = {
  elapsed: "elapsedUsDelta",
  wait: "waitTimeUsDelta",
  avg: "avgElapsed",
  execute: "executionsDelta",
};

export const metricLabelMap: Record<string, string> = {
  elapsed: "Elapsed Time",
  wait: "Wait Time",
  avg: "Avg Elapsed",
  execute: "Execute Count",
};

export const getMetricValue = (item: any, filter: string) => {
  const field = metricFieldMap[filter];
  return item?.[field] ?? 0;
};
