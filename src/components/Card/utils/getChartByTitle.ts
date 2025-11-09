import { mainChartRenderer } from "../chartRenderers/mainChartRenderer";
import { cpuChartRenderer } from "../chartRenderers/cpuChartRenderer";
import { ioChartRenderer } from "../chartRenderers/ioChartRenderer";
import { storageChartRenderer } from "../chartRenderers/storageChartRenderer";
import { memoryChartRenderer } from "../chartRenderers/memoryChartRenderer";
import { sessionChartRenderer } from "../chartRenderers/sessionChartRenderer";
import type { GraphDataResponse } from "@/api";

export type TabType = "main" | "cpu" | "memory" | "session" | "io" | "storage";

export const chartData: Record<TabType, string[]> = {
  main: [
    "세션 한도/급증",
    "PGA / SGA 압박률",
    "백그라운드 프로세스 상태",
    "CPU 사용(호스트 vs DB CPU)",
    "Wait Class 분포",
    "I/O 지연량",
    "I/O 처리량",
    "제한 근접 파라미터 감시",
    "핵심 테이블스페이스 여유율",
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
    "PGA Utilization (%) - Current",
    "SGA Utilization (%) - Current",
    "Workarea Spill Rate (%)",
    "PGA Utilization (%)",
    "SGA Composition (%)",
    "Library Cache Reloads per Second",
    "Buffer Cache Miss Rate (%) - Proxy",
    "Top SQL by Shared Pool Memory",
  ],
  session: [
    "Session Activity & Resource Summary",
    "Long-Idle Sessions ≥10/30/60m — Snapshot",
    "Blocking — Blocker vs Blocked Sessions",
    "Lock Wait Sessions — TX vs TM vs Total",
    "Active vs Inactive Sessions",
    "TPS",
    "On-CPU vs Wait (AAS 분해)",
    "Exec/s",
    "Logons/sec & Disconnects/sec",
    "Top Blocker Sessions — Snapshot Top 5",
  ],
  io: [
    "I/O Performance Dashboard",
    "Physical Reads vs Logical Reads",
    "Average I/O Wait Time",
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

// title을 기반으로 적절한 렌더러를 자동 반환
export const getChartByTitle = (
  title: string,
  graphData?: GraphDataResponse | null
) => {
  if (chartData.main.includes(title))
    return mainChartRenderer(title, graphData);
  if (chartData.cpu.includes(title)) return cpuChartRenderer(title);
  if (chartData.memory.includes(title)) return memoryChartRenderer(title);
  if (chartData.session.includes(title)) return sessionChartRenderer(title);
  if (chartData.io.includes(title)) return ioChartRenderer(title);
  if (chartData.storage.includes(title)) return storageChartRenderer(title);

  return null;
};
