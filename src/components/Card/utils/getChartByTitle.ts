import { renderMainChart } from "../chartRenderers/mainChartRenderer";
import { renderCPUChart } from "../chartRenderers/cpuChartRenderer";
import { renderMemoryChart } from "../chartRenderers/memoryChartRenderer";
import { renderSessionChart } from "../chartRenderers/sessionChartRenderer";
import { renderIOChart } from "../chartRenderers/ioChartRenderer";
import { renderStorageChart } from "../chartRenderers/storageChartRenderer";

export type TabType = "main" | "cpu" | "memory" | "session" | "io" | "storage";

export const chartData: Record<TabType, string[]> = {
  main: [
    "PGA / SGA 압박률",
    "Wait Class 분포",
    "Session 한도 상태",
    "핵심 테이블스페이스 여유율",
    "백그라운드 프로세스 상태",
    "제한 근접 파라미터 상태",
    "CPU 상태",
    "I/O 지연량",
    "I/O 처리량",
  ],
  cpu: [
    "Host CPU Utilization (%) - Current",
    "Host CPU Utilization (%) - Trend",
    "DB CPU Saturation (AAS vs Core)",
    "DB CPU Share of Host (%) - Trend",
    "CPU Cost per Commit/Execution (ms)",
    "Run Queue per Core (Scheduler Load)",
    "Top SQL by CPU (Last 10 min)",
  ],
  memory: [
    "PGA Utilization (%) - Current",
    "SGA Utilization (%) - Current",
    "Workarea Spill Rate (%) - Trend",
    "PGA Utilization (%) - Trend",
    "SGA Composition (%) - Trend",
    "Library Cache Reloads per Second - Trend",
    "Buffer Cache Miss Rate (%) - Proxy - Trend",
    "Top SQL by Shared Pool Memory",
  ],
  session: [
    "Now Tiles — Total Users / Blockers / Blocked",
    "Long-Idle Sessions ≥10/30/60m — Snapshot",
    "Blocking — Blocker vs Blocked Sessions — Trend",
    "Lock Wait Sessions — TX vs TM vs Total",
    "Active vs Inactive Sessions — Trend",
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
    "FRA 사용률 추세",
    "Undo 사용률 추세",
    "Total Database Usage Trend (%)",
    "테이블스페이스 사용률 추세",
    "테이블스페이스 증가 추세",
    "Temp Tablespace Active Usage (GB)",
    "대용량 세그먼트 Top 5",
  ],
};

// title을 기반으로 적절한 렌더러를 자동 반환
export const getChartByTitle = (title: string) => {
  if (chartData.main.includes(title)) return renderMainChart(title);
  if (chartData.cpu.includes(title)) return renderCPUChart(title);
  if (chartData.memory.includes(title)) return renderMemoryChart(title);
  if (chartData.session.includes(title)) return renderSessionChart(title);
  if (chartData.io.includes(title)) return renderIOChart(title);
  if (chartData.storage.includes(title)) return renderStorageChart(title);

  return null;
};
