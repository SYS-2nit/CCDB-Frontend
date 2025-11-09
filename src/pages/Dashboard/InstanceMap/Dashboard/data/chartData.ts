// 탭 타입 정의
export type TabType = "main" | "cpu" | "memory" | "session" | "io" | "storage";

// 탭별 차트 데이터
export const chartData: Record<TabType, string[]> = {
  main: [
<<<<<<< HEAD
    "세션 한도/급증",
    "PGA / SGA 압박률",
    "백그라운드 프로세스 상태",
    "CPU 사용(호스트 vs DB CPU)",
    "Wait Class 분포",
    "I/O 지연량",
    "I/O 처리량",
    "제한 근접 파라미터 감시",
=======
    "Session 한도 상태",
    "PGA / SGA 압박률",
    "백그라운드 프로세스 상태",
    "CPU 상태 (%)",
    "Wait Class 분포 (Sessions)",
    "I/O 지연량 (ms)",
    "I/O 처리량 (MB/s)",
    "제한 근접 파라미터 상태 (%)",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
