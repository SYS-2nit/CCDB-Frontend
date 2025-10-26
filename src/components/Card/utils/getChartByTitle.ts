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
  io: ["그래프1", "그래프2", "그래프3", "그래프4", "그래프5", "그래프6"],
  storage: [
    "그래프7",
    "그래프8",
    "그래프9",
    "그래프10",
    "그래프11",
    "그래프12",
  ],
};

// title을 기반으로 적절한 렌더러를 자동 반환
export const getChartByTitle = (title: string) => {
  // Main Custom 탭
  if (chartData.main.includes(title)) return renderMainChart(title);

  // CPU 탭
  if (chartData.cpu.includes(title)) return renderCPUChart(title);

  // Memory 탭
  if (chartData.memory.includes(title)) return renderMemoryChart(title);

  // Session 탭
  if (chartData.session.includes(title)) return renderSessionChart(title);

  // I/O 탭
  if (chartData.io.includes(title)) return renderIOChart(title);

  // Storage 탭
  if (chartData.storage.includes(title)) return renderStorageChart(title);

  return null; // 해당되는 차트가 없을 때
};
