import React from "react";
import { mainChartRenderer } from "../chartRenderers/mainChartRenderer";
import { cpuChartRenderer } from "../chartRenderers/cpuChartRenderer";
import { ioChartRenderer } from "../chartRenderers/ioChartRenderer";
import { storageChartRenderer } from "../chartRenderers/storageChartRenderer";
import { memoryChartRenderer } from "../chartRenderers/memoryChartRenderer";
import { sessionChartRenderer } from "../chartRenderers/sessionChartRenderer";
import type { GraphDataResponse } from "@/api/Dashboard/dashboard";
import type { DashboardMode } from "@/state/DashboardContext";
/** 탭 타입 정의 */
export type TabType = "main" | "cpu" | "memory" | "session" | "io" | "storage";

const fallbackStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
};

// Graph ID 범위로 카테고리 판단 (ID 기반 검증만 사용)
const getCategoryByGraphId = (graphId: number): TabType | null => {
  // CPU: 13-20
  if (graphId >= 13 && graphId <= 20) return "cpu";
  // Memory: 21-28
  if (graphId >= 21 && graphId <= 28) return "memory";
  // Session: 29-36
  if (graphId >= 29 && graphId <= 36) return "session";
  // I/O: 37-44 또는 41-48 (백엔드에 따라 다를 수 있음)
  if (graphId >= 37 && graphId <= 48) return "io";
  // Storage: 45-52 또는 49-56 (백엔드에 따라 다를 수 있음)
  if (graphId >= 49 && graphId <= 56) return "storage";
  // Main/Custom: 그 외의 ID들
  return "main";
};

// graphData의 ID를 기반으로 적절한 렌더러를 자동 반환 (이름 기반 검증 제거)
export const getChartByTitle = (
  title: string,
  graphData?: GraphDataResponse | null,
  mode: DashboardMode = "LIVE"
): React.ReactNode => {
  if (!graphData) {
    return React.createElement(
      "div",
      { style: fallbackStyle },
      "데이터가 없습니다."
    );
  }

  // Graph ID로 카테고리 판단
  const category = getCategoryByGraphId(graphData.id);

  if (category === "cpu") return cpuChartRenderer(title, graphData, mode);
  if (category === "memory") return memoryChartRenderer(title, graphData, mode);
  if (category === "session")
    return sessionChartRenderer(title, graphData, mode);
  if (category === "io") return ioChartRenderer(title, graphData, mode);
  if (category === "storage")
    return storageChartRenderer(title, graphData, mode);

  // Main/Custom 또는 매칭되지 않은 경우
  return mainChartRenderer(title, graphData, mode);
};
