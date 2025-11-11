import React from "react";
import { mainChartRenderer } from "../chartRenderers/mainChartRenderer";
import LineChart from "@/components/Chart/LineChart";
import GaugeChart from "@/components/Chart/GaugeChart";
import MetricGrid, { type MetricData } from "@/components/Card/MetricCard";
import StackChart from "@/components/Chart/StackChart";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import ErrorRedIcon from "@/assets/general/error-red.svg";
import type { GraphDataResponse } from "@/api/dashboard";
import type { DashboardMode } from "@/state/DashboardContext";

const ensureNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  return null;
};

const sortPoints = (graph: GraphDataResponse) => {
  const points = graph.data ?? [];
  return [...points].sort((a, b) => {
    const timeA = new Date(a.timestamp ?? 0).getTime();
    const timeB = new Date(b.timestamp ?? 0).getTime();
    return timeA - timeB;
  });
};

/**
 * 타임스탬프를 Asia/Seoul 타임존 기준으로 포맷팅
 * 백엔드에서 LocalDateTime을 전송할 때 타임존 정보가 없으므로,
 * 명시적으로 Asia/Seoul 타임존으로 해석하여 포맷팅합니다.
 */
const formatTime = (timestamp: string, mode: DashboardMode = "LIVE") => {
  if (!timestamp) return timestamp;
  
  // 백엔드에서 보낸 timestamp는 "2025-01-11T23:59:00" 형식 (타임존 없음)
  // 또는 배열 형식: ["2025", "01", "11", "23", "59", "00"]
  // 이를 Asia/Seoul 타임존으로 해석하기 위해 타임존을 명시적으로 추가
  let date: Date;
  
  try {
    // 타임존 정보 확인 (Z, +, - 뒤에 숫자가 있는지)
    const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(timestamp);
    
    if (!hasTimezone) {
      // 타임존 정보가 없는 경우: "2025-01-11T23:59:00"
      // Asia/Seoul 타임존(+09:00)으로 해석
      // ISO 8601 형식에 타임존을 추가
      if (timestamp.includes('T')) {
        date = new Date(timestamp + '+09:00');
      } else {
        // 날짜만 있는 경우 (YYYY-MM-DD)
        date = new Date(timestamp + 'T00:00:00+09:00');
      }
    } else if (timestamp.endsWith('Z') || timestamp.endsWith('z')) {
      // UTC인 경우 (Z로 끝남)
      date = new Date(timestamp);
    } else {
      // 이미 타임존 정보가 있는 경우
      date = new Date(timestamp);
    }
    
    if (Number.isNaN(date.getTime())) {
      console.warn(`[formatTime] Invalid timestamp: ${timestamp}`);
      return timestamp;
    }
  } catch (error) {
    console.warn(`[formatTime] Error parsing timestamp: ${timestamp}`, error);
    return timestamp;
  }
  
  // Asia/Seoul 타임존을 명시적으로 사용하여 포맷팅
  const timeZone = "Asia/Seoul";
  
  // 모드에 따라 시간 포맷 변경
  switch (mode) {
    case "LIVE":
      // 1분 단위: 시:분:초 형식 (오후/오전 표시)
      return date.toLocaleTimeString("ko-KR", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    case "10분":
      // 10분 단위: 시:분 형식
      return date.toLocaleTimeString("ko-KR", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
      });
    case "1시간":
      // 1시간 단위: 시:분 형식
      return date.toLocaleTimeString("ko-KR", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
      });
    case "1일":
      // 1일 단위: 월/일 시:분 형식
      return date.toLocaleString("ko-KR", {
        timeZone,
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    default:
      return date.toLocaleTimeString("ko-KR", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
      });
  }
};

const clampPercentage = (value: number) => Math.max(0, Math.min(100, value));

const renderGauge = (graph: GraphDataResponse, valueKey: string) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];
  const value = ensureNumber(latest.values?.[valueKey]);
  if (value === null) return null;
  return <GaugeChart value={clampPercentage(value)} />;
};

const renderMetricTiles = (
  graph: GraphDataResponse,
  mappings: Array<{ key: string; label: string; suffix?: string }>,
  columns = 2,
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];

  const metrics: MetricData[] = mappings.map(({ key, label, suffix }) => {
    const numeric = ensureNumber(latest.values?.[key]);
    let display: string | number = "-";
    if (numeric !== null) {
      if (suffix === "%") {
        display = `${numeric.toFixed(1)}%`;
      } else {
        display = numeric.toLocaleString();
      }
    } else if (typeof latest.values?.[key] === "string") {
      display = String(latest.values?.[key]);
    }

    return {
      title: label,
      value: display,
      subtitle: "",
    };
  });

  return <MetricGrid metrics={metrics} columns={columns} height={190} />;
};

const renderBackgroundMetrics = (graph: GraphDataResponse) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];

  const processes: Array<{ key: string; label: string }> = [
    { key: "lgwr_active", label: "LGWR" },
    { key: "dbwr_active", label: "DBWR" },
    { key: "pmon_active", label: "PMON" },
    { key: "smon_active", label: "SMON" },
    { key: "ckpt_active", label: "CKPT" },
    { key: "arcn_active", label: "ARC" },
  ];

  const metrics: MetricData[] = processes.map(({ key, label }) => {
    const numeric = ensureNumber(latest.values?.[key]);
    const isActive = numeric !== null ? numeric > 0 : latest.values?.[key] === "Y";
    return {
      title: label,
      icon: isActive ? SuccessGreenIcon : ErrorRedIcon,
      subtitle: isActive ? "정상" : "오류",
    };
  });

  return <MetricGrid metrics={metrics} columns={3} height={190} />;
};

const renderLine = (
  graph: GraphDataResponse,
  config: { keys: string[]; legends: string[] },
  mode: DashboardMode = "LIVE",
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;

  const categories = sorted.map((point) => formatTime(point.timestamp, mode));
  const seriesData = config.keys.map((key) =>
    sorted.map((point) => ensureNumber(point.values?.[key]) ?? 0),
  );

  // y축 범위를 데이터에 맞게 자동 조정
  const allValues = seriesData.flat();
  const minValue = Math.min(...allValues.filter(v => Number.isFinite(v)));
  const maxValue = Math.max(...allValues.filter(v => Number.isFinite(v)));
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <LineChart
      legends={config.legends}
      categories={categories}
      seriesData={seriesData}
      showLegend={config.legends.length > 1}
      yMin={minValue - padding}
      yMax={maxValue + padding}
    />
  );
};

const renderStack = (
  graph: GraphDataResponse,
  labels: string[],
  keys: string[],
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];

  const usage = keys.map((key) => ensureNumber(latest.values?.[key]) ?? 0);
  const totals = keys.map(() => 100);

  return (
    <StackChart
      labels={labels}
      usage={usage}
      total={totals}
      colorRules={[
        { min: 0, max: 69, color: "#22C55E" },
        { min: 70, max: 84, color: "#FACC15" },
        { min: 85, max: 100, color: "#EF4444" },
      ]}
      height={200}
    />
  );
};

const renderTopSql = (
  graph: GraphDataResponse,
  sqlIdKeys: string[],
  valueKeys: string[],
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];

  const labels: string[] = [];
  const usage: number[] = [];

  for (let i = 0; i < sqlIdKeys.length; i++) {
    const sqlId = latest.values?.[sqlIdKeys[i]];
    const value = ensureNumber(latest.values?.[valueKeys[i]]);
    
    if (sqlId && value !== null && value > 0) {
      labels.push(String(sqlId).substring(0, 20)); // SQL_ID를 20자로 제한
      usage.push(value);
    }
  }

  if (labels.length === 0) return null;

  // totals를 계산 (usage의 최대값 기준으로 상대적 비교 가능하도록)
  const maxUsage = Math.max(...usage);
  const adjustedTotals = usage.map(() => maxUsage * 1.2 || 100);

  return (
    <StackChart
      labels={labels}
      usage={usage}
      total={adjustedTotals}
      colorRules={[
        { min: 0, max: 100, color: "#3B82F6" },
      ]}
      tooltipFormatter={({ used, total, percent }) =>
        `CPU Time (ms): ${used.toLocaleString()}ms / Max: ${total.toLocaleString()}ms (${percent.toFixed(1)}%)`
      }
      height={200}
    />
  );
};

export const renderDynamicChart = (
  title: string,
  graph: GraphDataResponse | null | undefined,
  mode: DashboardMode = "LIVE",
): React.ReactNode => {
  if (!graph) return null;

  if (title.includes("Session 한도")) {
    return renderGauge(graph, "sessions_limit_util_pct");
  }

  if (title.includes("PGA / SGA")) {
    return renderMetricTiles(graph, [
      { key: "workarea_spill_rate_pct", label: "Spill Rate %", suffix: "%" },
      { key: "spill_mb_per_min", label: "Spill MB/min" },
      { key: "hard_parses_per_sec", label: "Hard Parses/s" },
      { key: "library_cache_reloads_per_sec", label: "Library Cache Reloads/s" },
    ]);
  }

  if (title.includes("백그라운드 프로세스")) {
    return renderBackgroundMetrics(graph);
  }

  if (title.includes("Wait Class")) {
    return renderLine(graph, {
      keys: [
        "wait_class_aas_user_io",
        "wait_class_aas_commit",
        "wait_class_aas_concurrency",
        "wait_class_aas_network",
        "wait_class_aas_other",
      ],
      legends: ["User I/O", "Commit", "Concurrency", "Network", "Other"],
    }, mode);
  }

  if (title.includes("CPU 상태") || title.includes("CPU 사용")) {
    return renderLine(graph, {
      keys: ["host_cpu_util_pct", "db_of_host_share_pct"],
      legends: ["Host CPU Util (%)", "DB CPU Share (%)"],
    }, mode);
  }

  if (title.includes("제한 근접")) {
    return renderLine(graph, {
      keys: [
        "processes_usage_pct",
        "sessions_usage_pct",
        "open_cursors_max_session_pct",
      ],
      legends: ["processes", "sessions", "open_cursors"],
    }, mode);
  }

  if (title.includes("I/O 지연량")) {
    return renderLine(graph, {
      keys: [
        "single_block_read_latency_ms",
        "direct_path_read_latency_ms",
        "direct_path_write_latency_ms",
      ],
      legends: [
        "Single Read (ms)",
        "Direct Read (ms)",
        "Direct Write (ms)",
      ],
    }, mode);
  }

  if (title.includes("I/O 처리량")) {
    return renderLine(graph, {
      keys: ["physical_read_mb_per_sec", "physical_write_mb_per_sec"],
      legends: ["Read MB/s", "Write MB/s"],
    }, mode);
  }

  if (title.includes("SGA 압박")) {
    return renderMetricTiles(graph, [
      { key: "shared_pool_free_bytes", label: "Shared Pool Free Bytes" },
      { key: "library_cache_reloads_per_sec", label: "Library Cache Reloads/s" },
    ]);
  }

  if (title.includes("아카이브 로그")) {
    return renderGauge(graph, "fra_usage_pct");
  }

  if (title.includes("AAS")) {
    return renderLine(graph, {
      keys: ["aas_total"],
      legends: ["AAS Total"],
    }, mode);
  }

  if (title.includes("핵심 테이블스페이스")) {
    return renderStack(
      graph,
      ["SYSTEM", "SYSAUX", "USERS", "UNDO", "TEMP"],
      [
        "system_ts_usage_pct",
        "sysaux_ts_usage_pct",
        "users_ts_usage_pct",
        "undo_ts_usage_pct",
        "temp_ts_usage_pct",
      ],
    );
  }

  // === CPU 카테고리 (그래프 ID 기반 매칭) ===
  // Graph ID 13: CPU 활동 현황 타일
  if (graph.id === 13 || title.includes("CPU Activity Overview Tiles") || title.includes("CPU 활동 현황 타일")) {
    return renderMetricTiles(graph, [
      { key: "host_cpu_util_pct", label: "Host CPU(%)", suffix: "%" },
      { key: "cpu_saturation_pct", label: "DB CPU Saturation(%)", suffix: "%" },
      { key: "db_of_host_share_pct", label: "DB Share of Host(%)", suffix: "%" },
      { key: "run_q_per_core_load_proxy", label: "Run Queue per Core(process)" },
      { key: "tps_per_sec", label: "TPS" },
      { key: "execs_per_sec", label: "EXEC/S" },
      { key: "user_calls_per_sec", label: "USER CALLS/S" },
    ], 7);
  }

  // Graph ID 19: Foreground vs Background CPU 추이
  if (graph.id === 19 || (title.includes("Foreground vs Background CPU") && title.includes("AAS"))) {
    return renderLine(graph, {
      keys: ["aas_fg_sessions", "aas_bg_sessions"],
      legends: ["Foreground AAS", "Background AAS"],
    }, mode);
  }

  // Graph ID 15: Host CPU Utilization
  if (graph.id === 15 || (title.includes("Host CPU Utilization") && title.includes("Trend"))) {
    return renderLine(graph, {
      keys: ["host_cpu_util_pct"],
      legends: ["Host CPU Util (%)"],
    }, mode);
  }

  // Graph ID 14: DB CPU Saturation - AAS vs Core
  if (graph.id === 14 || (title.includes("DB CPU Saturation") && title.includes("AAS vs Core"))) {
    return renderLine(graph, {
      keys: ["cpu_saturation_pct", "aas_total"],
      legends: ["CPU Saturation (%)", "AAS Total"],
    }, mode);
  }

  // Graph ID 16: DB CPU Share of Host
  if (graph.id === 16 || (title.includes("DB CPU Share of Host") && title.includes("Trend"))) {
    return renderLine(graph, {
      keys: ["db_of_host_share_pct"],
      legends: ["DB CPU Share (%)"],
    }, mode);
  }

  // Graph ID 18: CPU Cost per Commit/Execution
  if (graph.id === 18 || (title.includes("CPU Cost per Commit") || title.includes("CPU Cost per Exec"))) {
    return renderLine(graph, {
      keys: ["cpu_per_commit_ms", "cpu_per_exec_ms"],
      legends: ["CPU per Commit (ms)", "CPU per Exec (ms)"],
    }, mode);
  }

  // Graph ID 17: Run Queue per Core - Scheduler Load
  if (graph.id === 17 || title.includes("Run Queue per Core") || title.includes("Scheduler Load")) {
    return renderLine(graph, {
      keys: ["run_q_per_core_load_proxy"],
      legends: ["Run Queue per Core"],
    }, mode);
  }

  // Graph ID 20: Top SQL by CPU
  if (graph.id === 20 || title.includes("Top SQL by CPU")) {
    return renderTopSql(
      graph,
      [
        "top_sql_by_cpu_sql_id_01",
        "top_sql_by_cpu_sql_id_02",
        "top_sql_by_cpu_sql_id_03",
        "top_sql_by_cpu_sql_id_04",
        "top_sql_by_cpu_sql_id_05",
      ],
      [
        "top_sql_by_cpu_value_01",
        "top_sql_by_cpu_value_02",
        "top_sql_by_cpu_value_03",
        "top_sql_by_cpu_value_04",
        "top_sql_by_cpu_value_05",
      ],
    );
  }

  // === MEMORY 카테고리 ===
  if (title.includes("PGA Execution Memory") && title.includes("Processes")) {
    return renderMetricTiles(graph, [
      { key: "pga_used_bytes", label: "PGA Used (bytes)" },
      { key: "pga_target_bytes", label: "PGA Target (bytes)" },
      { key: "pga_util_pct", label: "PGA Util (%)", suffix: "%" },
      { key: "memory_sort_pct", label: "Memory Sort (%)", suffix: "%" },
      { key: "dedicated_sess_cnt", label: "Dedicated" },
      { key: "parallel_proc_cnt", label: "Parallel" },
      { key: "shared_server_proc_cnt", label: "Shared" },
      { key: "dispatcher_proc_cnt", label: "Dispatcher" },
      { key: "job_proc_cnt", label: "Job" },
    ], 3);
  }

  if (title.includes("SGA Efficiency") && title.includes("Memory Pools")) {
    return renderMetricTiles(graph, [
      { key: "sga_util_pct", label: "SGA Usage", suffix: "%" },
      { key: "shared_pool_free_pct", label: "Shared Pool", suffix: "%" },
      { key: "library_cache_mb", label: "Lib.Cache", suffix: " MB" },
      { key: "dictionary_cache_mb", label: "Dic.Cache", suffix: " MB" },
      { key: "large_pool_mb", label: "Large Pool", suffix: " MB" },
      { key: "java_pool_mb", label: "Java Pool", suffix: " MB" },
      { key: "log_buffer_mb", label: "Log Buffer", suffix: " MB" },
      { key: "buffer_cache_mb", label: "Buffer Cache", suffix: " MB" },
    ], 4);
  }

  if (title.includes("PGA Utilization") && title.includes("Trend")) {
    return renderLine(graph, {
      keys: ["pga_util_pct"],
      legends: ["PGA Utilization (%)"],
    }, mode);
  }

  if (title.includes("SGA Utilization") && title.includes("Trend")) {
    return renderLine(graph, {
      keys: ["sga_util_pct"],
      legends: ["SGA Utilization (%)"],
    }, mode);
  }

  if (title.includes("Workarea Spill Rate") && title.includes("Trend")) {
    return renderLine(graph, {
      keys: ["workarea_spill_rate_pct"],
      legends: ["Spill Rate (%)"],
    }, mode);
  }

  if (title.includes("Library Cache Reloads per Second") && title.includes("Trend")) {
    return renderLine(graph, {
      keys: ["library_cache_reloads_per_sec"],
      legends: ["Reloads/s"],
    }, mode);
  }

  if (title.includes("Buffer Cache Miss Rate") && title.includes("Proxy")) {
    return renderLine(graph, {
      keys: ["buffer_miss_pct"],
      legends: ["Miss Rate (%)"],
    }, mode);
  }

  // === SESSION 카테고리 ===
  if (title.includes("Active vs Inactive Sessions") && title.includes("Trend")) {
    return renderLine(graph, {
      keys: ["active_user_sessions_now", "inactive_user_sessions_now"],
      legends: ["Active", "Inactive"],
    }, mode);
  }

  if (title.includes("On-CPU vs Wait") && title.includes("AAS 분해")) {
    return renderLine(graph, {
      keys: ["aas_oncpu_sessions", "aas_wait_sessions"],
      legends: ["On-CPU", "Wait"],
    }, mode);
  }

  if (title.includes("Lock Wait Sessions") && (title.includes("TX") || title.includes("TM"))) {
    return renderLine(graph, {
      keys: ["lock_wait_tx", "lock_wait_tm", "lock_wait_total"],
      legends: ["TX", "TM", "Total"],
    }, mode);
  }

  if (title.includes("TPS") && title.includes("Trend")) {
    return renderLine(graph, {
      keys: ["tps_per_sec"],
      legends: ["TPS"],
    }, mode);
  }

  if (title.includes("Exec/s") && title.includes("Trend")) {
    return renderLine(graph, {
      keys: ["execs_per_sec"],
      legends: ["Exec/s"],
    }, mode);
  }

  if (title.includes("Logons/sec") || title.includes("Disconnects/sec")) {
    return renderLine(graph, {
      keys: ["logons_per_sec", "disconnects_per_sec"],
      legends: ["Logons/s", "Disconnects/s"],
    }, mode);
  }

  if (title.includes("Session Activity") && title.includes("Resource Summary")) {
    return renderMetricTiles(graph, [
      { key: "active_user_sessions_now", label: "Active / Total Users" },
      { key: "sessions_limit_util_pct", label: "Sessions Limit Util(%)", suffix: "%" },
      { key: "processes_limit_util_pct", label: "Processes Limit Util(%)", suffix: "%" },
      { key: "blockers_now", label: "Blockers(session)" },
      { key: "blocked_now", label: "Blocked(session)" },
    ], 5);
  }

  // === I/O 카테고리 ===
  if (title.includes("I/O Performance Dashboard")) {
    return renderMetricTiles(graph, [
      { key: "buffer_cache_hit_pct", label: "Cache Hit Ratio(%)", suffix: "%" },
      { key: "single_block_read_latency_ms", label: "Avg I/O Wait Time(ms)", suffix: " ms" },
      { key: "physical_reads_per_sec", label: "Physical Reads(/s)" },
      { key: "redo_generation_mbps", label: "Redo Size(MB/s)", suffix: " MB/s" },
      { key: "hard_parse_ratio_pct", label: "Parse/Execute Ratio", suffix: "%" },
      { key: "direct_path_io_per_sec", label: "Direct Path I/O(/s)" },
    ], 6);
  }

  if (title.includes("Direct Path I/O")) {
    return renderLine(graph, {
      keys: ["direct_path_read_latency_ms", "direct_path_write_latency_ms", "direct_path_io_per_sec"],
      legends: ["Direct Read (ms)", "Direct Write (ms)", "Direct I/O (/s)"],
    }, mode);
  }

  if (title.includes("SQL Parsing") && title.includes("Execution")) {
    return renderLine(graph, {
      keys: ["hard_parses_per_sec", "execs_per_sec"],
      legends: ["Parses/s", "Exec/s"],
    }, mode);
  }

  if (title.includes("Physical Reads vs Logical Reads")) {
    return renderLine(graph, {
      keys: ["physical_reads_per_sec", "logical_reads_per_sec"],
      legends: ["Physical Reads/s", "Logical Reads/s"],
    }, mode);
  }

  if (title.includes("Average I/O Wait Time")) {
    return renderLine(graph, {
      keys: ["single_block_read_latency_ms", "direct_path_read_latency_ms"],
      legends: ["Single Read (ms)", "Direct Read (ms)"],
    }, mode);
  }

  if (title.includes("Redo Generation Rate")) {
    return renderLine(graph, {
      keys: ["redo_generation_mbps"],
      legends: ["Redo (MB/s)"],
    }, mode);
  }

  // === STORAGE 카테고리 ===
  if (title.includes("Storage Health Dashboard")) {
    return renderMetricTiles(graph, [
      { key: "fra_usage_pct", label: "FRA Usage(%)", suffix: "%" },
      { key: "undo_ts_usage_pct", label: "Undo Usage(%)", suffix: "%" },
      { key: "temp_ts_usage_pct", label: "Temp Usage(%)", suffix: "%" },
      { key: "users_ts_usage_pct", label: "USERS(%)", suffix: "%" },
      { key: "max_ts_usage_pct", label: "Max TS Usage(%)", suffix: "%" },
      { key: "total_db_usage_pct", label: "Total DB Usage(GB)", suffix: " GB" },
    ], 6);
  }

  if (title.includes("Temp Tablespace Active Usage")) {
    return renderLine(graph, {
      keys: ["temp_active_usage_gb"],
      legends: ["Temp Usage (GB)"],
    }, mode);
  }

  if (title.includes("테이블스페이스 사용률 추세")) {
    return renderLine(graph, {
      keys: ["system_ts_usage_pct", "sysaux_ts_usage_pct", "users_ts_usage_pct", "undo_ts_usage_pct", "temp_ts_usage_pct"],
      legends: ["SYSTEM", "SYSAUX", "USERS", "UNDO", "TEMP"],
    }, mode);
  }

  if (title.includes("테이블스페이스 증가 추세")) {
    return renderStack(
      graph,
      ["SYSTEM", "SYSAUX", "UNDOTBS1", "USERS"],
      [
        "system_used_space_gb_inc",
        "sysaux_used_space_gb_inc",
        "undotbs1_used_space_gb_inc",
        "users_used_space_gb_inc",
      ],
    );
  }

  if (title.includes("FRA 사용률 추세")) {
    return renderLine(graph, {
      keys: ["fra_usage_pct"],
      legends: ["FRA Usage (%)"],
    }, mode);
  }

  if (title.includes("Undo 사용률 추세")) {
    return renderLine(graph, {
      keys: ["undo_ts_usage_pct"],
      legends: ["Undo Usage (%)"],
    }, mode);
  }

  if (title.includes("Total Database Usage Trend")) {
    return renderLine(graph, {
      keys: ["total_db_usage_pct"],
      legends: ["Total Usage (%)"],
    }, mode);
  }

  if (graph.type != null) {
    return mainChartRenderer(title, graph, mode);
  }

  return null;
};
