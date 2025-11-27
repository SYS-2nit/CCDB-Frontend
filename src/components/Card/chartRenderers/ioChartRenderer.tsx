import React from "react";
import type { GraphDataResponse } from "@/api/Dashboard/dashboard";
import { renderDynamicChart } from "../utils/renderDynamicChart";
import { mainChartRenderer } from "./mainChartRenderer";
import type { DashboardMode } from "@/state/DashboardContext";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

// I/O 탭 전용 차트 렌더러
export const ioChartRenderer = (
  title: string,
  graphData?: GraphDataResponse | null,
  mode: DashboardMode = "LIVE"
): React.ReactNode => {
  if (!graphData) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
        }}
      >
        데이터가 없습니다.
      </div>
    );
  }

  const rendered = renderDynamicChart(title, graphData, mode);
  if (rendered) return rendered;

  if (graphData.type != null) {
    return mainChartRenderer(title, graphData, mode);
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
      }}
    >
      데이터가 없습니다.
    </div>
  );
};
