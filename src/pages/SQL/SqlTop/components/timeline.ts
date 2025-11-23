import type { PeriodGraphItem } from "../../types";

// 기간 그래프 표시를 위한 타임라인 생성 및 값 매핑 처리
export const buildTimeline = (
  startDate: string,
  compareDate: string,
  interval: number
): string[] => {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(compareDate + "T23:59:59");

  const times: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    times.push(
      `${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(
        cursor.getDate()
      ).padStart(2, "0")} ${String(cursor.getHours()).padStart(
        2,
        "0"
      )}:${String(cursor.getMinutes()).padStart(2, "0")}`
    );
    cursor.setMinutes(cursor.getMinutes() + interval);
  }

  return times;
};

export const mapValuesToTimeline = (
  timeline: string[],
  period: PeriodGraphItem[]
): number[] => {
  const map = new Map<string, number>(
    period.map((d) => {
      const dt = new Date(d.datetime);
      const key = `${String(dt.getMonth() + 1).padStart(2, "0")}-${String(
        dt.getDate()
      ).padStart(2, "0")} ${String(dt.getHours()).padStart(2, "0")}:${String(
        dt.getMinutes()
      ).padStart(2, "0")}`;
      return [key, d.value];
    })
  );

  return timeline.map((t) => map.get(t) ?? 0);
};
