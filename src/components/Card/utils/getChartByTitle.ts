import React from "react";
import { mainChartRenderer } from "../chartRenderers/mainChartRenderer";
import { cpuChartRenderer } from "../chartRenderers/cpuChartRenderer";
import { ioChartRenderer } from "../chartRenderers/ioChartRenderer";
import { storageChartRenderer } from "../chartRenderers/storageChartRenderer";
import { memoryChartRenderer } from "../chartRenderers/memoryChartRenderer";
import { sessionChartRenderer } from "../chartRenderers/sessionChartRenderer";
import type { GraphDataResponse } from "@/api/dashboard";
import type { DashboardMode } from "@/state/DashboardContext";
/** 탭 타입 정의 */
export type TabType = "main" | "cpu" | "memory" | "session" | "io" | "storage";

/** 각 탭별 차트 목록 */
export const chartData: Record<TabType, string[]> = {
  main: [
    "세션 한도/급증",
    "PGA / SGA 압박률",
    "SGA 압박(FreeMB/Reloads)",
    "AAS",
    "Wait Class 분포",
    "Wait Class 분포 (Sessions)",
    "CPU 사용(호스트 vs DB CPU)",
    "CPU 상태 (%)",
    "I/O 지연량",
    "I/O 지연량 (ms)",
    "I/O 처리량",
    "I/O 처리량 (MB/s)",
    "아카이브 로그 적체/목적지 FULL",
    "핵심 테이블스페이스 여유율",
    "백그라운드 프로세스 상태",
    "제한 근접 파라미터 상태 (%)",
  ],
  cpu: [
    "CPU 활동 현황 타일",
    "Foreground vs Background CPU 추이 (AAS)",
    "Host CPU Utilization (%)",
    "DB CPU Saturation - AAS vs Core (Load)",
    "DB CPU Share of Host (%)",
    "CPU Cost per Commit/Execution (ms)",
    "Run Queue per Core - Scheduler Load (%)",
    "Top SQL by CPU (Last 10 min)",
  ],
  memory: [
    "SGA Efficiency & Memory Pools",
    "PGA Execution Memory & Processes",
    "SGA Utilization (%)",
    "PGA Utilization (%)",
    "Workarea Spill Rate (%)",
    "Library Cache Reloads per Second",
    "Buffer Cache Miss Rate (%) - Proxy",
    "Top SQL by Shared Pool Memory",
  ],
  session: [
    "Session Activity & Resource Summary",
    "Active vs Inactive Sessions",
    "Lock Wait Sessions — TX vs TM vs Total",
    "TPS",
    "On-CPU vs Wait (AAS 분해)",
    "Exec/s",
    "Logons/sec & Disconnects/sec",
    "Top Blocker Sessions — Snapshot Top 5",
  ],
  io: [
    "I/O Performance Dashboard",
    "Physical Reads vs Logical Reads",
    "Average I/O Wait Time (ms)",
    "데이터파일별 I/O 통계 (Top 5)",
    "Direct Path I/O",
    "Redo Generation Rate",
    "DBWR Checkpoint Activity",
    "SQL Parsing & Execution",
  ],
  storage: [
    "Storage Health Dashboard",
    "FRA 사용률 추세 (%)",
    "Undo 사용률 추세 (%)",
    "Total Database Usage Trend (%)",
    "테이블스페이스 사용률 추세 (%)",
    "테이블스페이스 증가 추세 (GB)",
    "Temp Tablespace Active Usage (GB)",
    "대용량 세그먼트 Top 5",
  ],
};

const fallbackStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
};

// title을 기반으로 적절한 렌더러를 자동 반환
export const getChartByTitle = (
  title: string,
  graphData?: GraphDataResponse | null,
  mode: DashboardMode = "LIVE",
): React.ReactNode => {
  if (chartData.main.includes(title)) return mainChartRenderer(title, graphData, mode);
  if (chartData.cpu.includes(title)) return cpuChartRenderer(title, graphData, mode);
  if (chartData.memory.includes(title)) return memoryChartRenderer(title, graphData, mode);
  if (chartData.session.includes(title)) return sessionChartRenderer(title, graphData, mode);
  if (chartData.io.includes(title)) return ioChartRenderer(title, graphData, mode);
  if (chartData.storage.includes(title)) return storageChartRenderer(title, graphData, mode);

  return React.createElement("div", { style: fallbackStyle }, "데이터가 없습니다.");
};
