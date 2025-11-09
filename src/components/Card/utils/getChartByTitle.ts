import { mainChartRenderer } from "../chartRenderers/mainChartRenderer";
import { cpuChartRenderer } from "../chartRenderers/cpuChartRenderer";
import { ioChartRenderer } from "../chartRenderers/ioChartRenderer";
import { storageChartRenderer } from "../chartRenderers/storageChartRenderer";
import { memoryChartRenderer } from "../chartRenderers/memoryChartRenderer";
import { sessionChartRenderer } from "../chartRenderers/sessionChartRenderer";
<<<<<<< HEAD
import type { GraphDataResponse } from "@/api";
=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b

export type TabType = "main" | "cpu" | "memory" | "session" | "io" | "storage";

export const chartData: Record<TabType, string[]> = {
  main: [
    "세션 한도/급증",
    "PGA / SGA 압박률",
<<<<<<< HEAD
    "백그라운드 프로세스 상태",
    "CPU 사용(호스트 vs DB CPU)",
    "Wait Class 분포",
    "I/O 지연량",
    "I/O 처리량",
    "제한 근접 파라미터 감시",
    "핵심 테이블스페이스 여유율",
=======
    "Wait Class 분포 (Sessions)",
    "Session 한도 상태",
    "핵심 테이블스페이스 여유율",
    "백그라운드 프로세스 상태",
    "제한 근접 파라미터 상태 (%)",
    "CPU 상태 (%)",
    "I/O 지연량 (ms)",
    "I/O 처리량 (MB/s)",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
<<<<<<< HEAD
    "PGA Utilization (%) - Current",
    "SGA Utilization (%) - Current",
    "Workarea Spill Rate (%)",
    "PGA Utilization (%)",
    "SGA Composition (%)",
=======
    "SGA Efficiency & Memory Pools",
    "PGA Execution Memory & Processes",
    "SGA Utilization (%)",
    "PGA Utilization (%)",
    "Workarea Spill Rate (%)",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
    "Library Cache Reloads per Second",
    "Buffer Cache Miss Rate (%) - Proxy",
    "Top SQL by Shared Pool Memory",
  ],
  session: [
    "Session Activity & Resource Summary",
<<<<<<< HEAD
    "Long-Idle Sessions ≥10/30/60m — Snapshot",
    "Blocking — Blocker vs Blocked Sessions",
    "Lock Wait Sessions — TX vs TM vs Total",
    "Active vs Inactive Sessions",
=======
    "Active vs Inactive Sessions",
    "Lock Wait Sessions — TX vs TM vs Total",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
    "TPS",
    "On-CPU vs Wait (AAS 분해)",
    "Exec/s",
    "Logons/sec & Disconnects/sec",
    "Top Blocker Sessions — Snapshot Top 5",
  ],
  io: [
    "I/O Performance Dashboard",
    "Physical Reads vs Logical Reads",
<<<<<<< HEAD
    "Average I/O Wait Time",
=======
    "Average I/O Wait Time (ms)",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
<<<<<<< HEAD
export const getChartByTitle = (
  title: string,
  graphData?: GraphDataResponse | null
) => {
  if (chartData.main.includes(title))
    return mainChartRenderer(title, graphData);
=======
export const getChartByTitle = (title: string) => {
  if (chartData.main.includes(title)) return mainChartRenderer(title);
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
  if (chartData.cpu.includes(title)) return cpuChartRenderer(title);
  if (chartData.memory.includes(title)) return memoryChartRenderer(title);
  if (chartData.session.includes(title)) return sessionChartRenderer(title);
  if (chartData.io.includes(title)) return ioChartRenderer(title);
  if (chartData.storage.includes(title)) return storageChartRenderer(title);

  return null;
};
