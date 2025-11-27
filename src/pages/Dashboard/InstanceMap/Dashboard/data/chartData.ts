/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

// 탭 타입 정의
export type TabType =
  | "performance"
  | "prevention"
  | "main"
  | "cpu"
  | "memory"
  | "session"
  | "io"
  | "storage";

// 탭별 차트 데이터
export const chartData: Record<TabType, string[]> = {
  performance: ["DB CPU 효율 추세", "SGA Hit Ratio 변화"],
  prevention: ["장애 발생률 예측", "Redo Log I/O Delay Trend"],
  main: [
    "Session 한도 상태",
    "PGA / SGA 압박률",
    "백그라운드 프로세스 상태",
    "CPU 상태 (%)",
    "Wait Class 분포 (Sessions)",
    "I/O 지연량 (ms)",
    "I/O 처리량 (MB/s)",
    "제한 근접 파라미터 상태 (%)",
    "핵심 테이블스페이스 여유율",
  ],
  cpu: [
    "CPU 사용 현황",
    "호스트 CPU 사용률 (%)",
    "DB CPU 점유율 (%)",
    "DB CPU 포화도 (AAS On-CPU)",
    "포그라운드 & 백그라운드 CPU 사용량 (AAS)",
    "Run Q (process/core)",
    "커밋/실행당 CPU 소요시간 (ms)",
    "Top SQL CPU 사용량",
  ],
  memory: [
    "Buffer Cache 미스 비율 (%)",
    "SGA 메모리 구성 & 풀 사용 현황",
    "PGA 메모리 & 프로세스 현황",
    "SGA 사용률 (%)",
    "PGA 사용률 (%)",
    "Workarea Spill 비율 (%)",
    "LibraryCache 재적재 빈도 (Reload/s)",
    "TOP SQL Shared Pool 사용량",
  ],
  session: [
    "세션 활동·자원 현황",
    "활성 세션 & 비활성 세션",
    "로그 인·아웃(Session/s)",
    "On-CPU vs Wait (AAS 분해)",
    "TPS",
    "대기 세션 (TX & TM)",
    "SQL 실행량 (Exec/s)",
    "TOP 블로커 세션",
  ],
  io: [
    "I/O 성능 현황",
    "Physical Reads & Logical Reads (Read/s)",
    "평균 I/O 지연 (ms)",
    "데이터파일별 I/O 통계 (Top 5)",
    "Direct Path I/O (Read·Write/s)",
    "Redo 생성량 (MB/s)",
    "DBWR 체크포인트 활동",
    "SQL 실행/파싱 비율",
  ],
  storage: [
    "스토리지 상태 요약",
    "FRA 사용률 (%)",
    "Undo 사용률 (%)",
    "DB 저장공간 사용률 (%)",
    "테이블스페이스 사용률 (%)",
    "테이블스페이스 사용량(GB)",
    "TEMP 사용량 (GB)",
    "대용량 세그먼트 Top 5",
  ],
};
