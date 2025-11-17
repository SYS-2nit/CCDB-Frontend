/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { getMetricValue } from "./metric";

export interface RankData {
  rank: number;
  rankChanged: React.ReactNode;
  ratio: number;
  exec: number;
  sqlId: string;
  query: string;
}

// SQL 랭킹 계산, 정렬, 비율 변환 등 순수 랭킹 로직 처리
export const calcRankChange = (baseRank: number, compareRank: number) => {
  if (baseRank === 0 || compareRank === 0) return "-";

  const diff = compareRank - baseRank;

  if (diff > 0) return <span style={{ color: "#1E90FF" }}>▼ -{diff}</span>;
  if (diff < 0)
    return <span style={{ color: "#FF3B30" }}>▲ +{Math.abs(diff)}</span>;

  return "-";
};

export const convertList = (list: any[], filter: string): RankData[] => {
  if (!list || list.length === 0) return [];

  const max = Math.max(...list.map((item) => getMetricValue(item, filter)), 1);

  return list.slice(0, 10).map((item, i) => ({
    rank: i + 1,
    rankChanged: "-",
    ratio: Number(((getMetricValue(item, filter) / max) * 100).toFixed(1)),
    exec: getMetricValue(item, filter),
    sqlId: item.sqlId,
    query: item.sqlText ?? "-",
  }));
};

export const alignBySqlId = (base: RankData[], compare: RankData[]) => {
  const ids = Array.from(
    new Set([...base.map((b) => b.sqlId), ...compare.map((c) => c.sqlId)])
  );

  ids.sort((a, b) => {
    const A = base.find((x) => x.sqlId === a);
    const B = compare.find((x) => x.sqlId === b);

    if (A && B) return A.rank - B.rank;
    if (A) return -1;
    if (B) return 1;
    return 0;
  });

  const baseAligned: RankData[] = [];
  const compareAligned: RankData[] = [];

  ids.forEach((id) => {
    const b = base.find((x) => x.sqlId === id);
    const c = compare.find((x) => x.sqlId === id);

    const baseRank = b?.rank ?? 0;
    const compareRank = c?.rank ?? 0;
    const rankChanged = calcRankChange(baseRank, compareRank);

    const query = b?.query ?? c?.query ?? "-";

    baseAligned.push(
      b || { rank: 0, rankChanged, ratio: 0, exec: 0, sqlId: id, query }
    );

    compareAligned.push(
      c || { rank: 0, rankChanged, ratio: 0, exec: 0, sqlId: id, query }
    );
  });

  return {
    base: baseAligned.map((r, i) => ({ ...r, rank: i + 1 })).slice(0, 10),
    compare: compareAligned.map((r, i) => ({ ...r, rank: i + 1 })).slice(0, 10),
  };
};
