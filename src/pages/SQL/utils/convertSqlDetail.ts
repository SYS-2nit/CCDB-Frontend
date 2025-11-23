import type { SqlDetailItem } from "@/api/Sql/sql";
import type { SqlDetailDrawerData } from "../types";

/**
 * SqlDetailItem을 SqlDetailDrawerData로 변환
 */
export const convertSqlDetailToDrawerData = (
  item: SqlDetailItem,
  date?: string
): SqlDetailDrawerData => {
  return {
    ...item,
    date: date || "",
    planHistoryList: [],
    beforePlanHash: null,
    beforePlanText: "",
    afterPlanHash: null,
    afterPlanText: "",
    elapsedTrend: item.elapsedTrend.map((t) => ({
      time: t.label,
      label: t.label,
      value: t.value,
    })),
    cpuTrend: item.cpuTrend.map((t) => ({
      time: t.label,
      label: t.label,
      value: t.value,
    })),
    execTrend: item.execTrend.map((t) => ({
      time: t.label,
      label: t.label,
      value: t.value,
    })),
    bufferTrend: item.bufferTrend.map((t) => ({
      time: t.label,
      label: t.label,
      value: t.value,
    })),
    diskTrend: item.diskTrend.map((t) => ({
      time: t.label,
      label: t.label,
      value: t.value,
    })),
    waitTrend: item.waitTrend.map((t) => ({
      time: t.label,
      label: t.label,
      value: t.value,
    })),
  };
};

