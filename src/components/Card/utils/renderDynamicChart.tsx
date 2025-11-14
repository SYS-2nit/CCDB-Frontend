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
      if (timestamp.includes("T")) {
        date = new Date(timestamp + "+09:00");
      } else {
        // 날짜만 있는 경우 (YYYY-MM-DD)
        date = new Date(timestamp + "T00:00:00+09:00");
      }
    } else if (timestamp.endsWith("Z") || timestamp.endsWith("z")) {
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
      // 24시간 형식으로 포맷팅 (HH:mm)
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    case "10분":
      // 10분 단위: 24시간 형식 (HH:mm)
      const hours10 = String(date.getHours()).padStart(2, "0");
      const minutes10 = String(date.getMinutes()).padStart(2, "0");
      return `${hours10}:${minutes10}`;
    case "1시간":
      // 1시간 단위: 24시간 형식 (HH:mm)
      const hours1h = String(date.getHours()).padStart(2, "0");
      const minutes1h = String(date.getMinutes()).padStart(2, "0");
      return `${hours1h}:${minutes1h}`;
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
      // 24시간 형식으로 포맷팅 (HH:mm)
      const defaultHours = String(date.getHours()).padStart(2, "0");
      const defaultMinutes = String(date.getMinutes()).padStart(2, "0");
      return `${defaultHours}:${defaultMinutes}`;
  }
};

const clampPercentage = (value: number) => Math.max(0, Math.min(100, value));

const renderGauge = (graph: GraphDataResponse, valueKey: string) => {
  // 타임스탬프 기준으로 내림차순 정렬 (가장 최근 데이터가 첫 번째)
  const points = graph.data ?? [];
  const sorted = [...points].sort((a, b) => {
    const timeA = new Date(a.timestamp ?? 0).getTime();
    const timeB = new Date(b.timestamp ?? 0).getTime();
    return timeB - timeA; // 내림차순 정렬 (최신이 먼저)
  });

  if (sorted.length === 0) return null;

  // 가장 최근 데이터 (정렬 후 첫 번째)
  const latest = sorted[0];
  const value = ensureNumber(latest.values?.[valueKey]);
  if (value === null) return null;
  return <GaugeChart value={clampPercentage(value)} />;
};

const renderMetricTiles = (
  graph: GraphDataResponse,
  mappings: Array<{ key: string; label: string; suffix?: string }>,
  columns = 2
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];

  // 서버에서 받은 실제 키 목록 (대소문자 포함)
  const availableKeys = Object.keys(latest.values ?? {});

  // 하드코딩된 키를 서버의 실제 키로 매칭 (대소문자 무시)
  const findMatchingKey = (requestedKey: string): string | null => {
    const lowerRequested = requestedKey.toLowerCase();
    // 정확히 일치하는 경우
    if (availableKeys.includes(requestedKey)) {
      return requestedKey;
    }
    // 대소문자 무시 매칭
    const matched = availableKeys.find(
      (k) => k.toLowerCase() === lowerRequested
    );
    return matched ?? null;
  };

  const metrics: MetricData[] = mappings.map(({ key, label, suffix }) => {
    const matchedKey = findMatchingKey(key);
    if (!matchedKey) {
      console.warn(
        `컬럼 '${key}'를 찾을 수 없습니다. 사용 가능한 키:`,
        availableKeys
      );
      return {
        title: label,
        value: "-",
        subtitle: "",
      };
    }

    const numeric = ensureNumber(latest.values?.[matchedKey]);
    let display: string | number = "-";
    if (numeric !== null) {
      if (suffix === "%") {
        display = `${numeric.toFixed(1)}%`;
      } else {
        display = numeric.toLocaleString();
      }
    } else if (typeof latest.values?.[matchedKey] === "string") {
      display = String(latest.values?.[matchedKey]);
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
    const isActive =
      numeric !== null ? numeric > 0 : latest.values?.[key] === "Y";
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
  mode: DashboardMode = "LIVE"
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) {
    // 데이터가 없어도 빈 차트를 표시하여 그래프가 사라지지 않도록 함
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

  // 서버에서 받은 실제 키 목록 (대소문자 포함)
  const availableKeys =
    sorted.length > 0 ? Object.keys(sorted[0].values ?? {}) : [];

  // 하드코딩된 키를 서버의 실제 키로 매칭 (대소문자 무시)
  const findMatchingKey = (requestedKey: string): string | null => {
    const lowerRequested = requestedKey.toLowerCase();
    // 정확히 일치하는 경우
    if (availableKeys.includes(requestedKey)) {
      return requestedKey;
    }
    // 대소문자 무시 매칭
    const matched = availableKeys.find(
      (k) => k.toLowerCase() === lowerRequested
    );
    return matched ?? null;
  };

  const categories = sorted.map((point) => formatTime(point.timestamp, mode));
  const matchedKeys: string[] = [];
  const seriesData = config.keys.map((key) => {
    const matchedKey = findMatchingKey(key);
    if (!matchedKey) {
      console.warn(
        `컬럼 '${key}'를 찾을 수 없습니다. 사용 가능한 키:`,
        availableKeys
      );
      return null; // 매칭 실패 시 null 반환
    }
    matchedKeys.push(matchedKey);
    return sorted.map((point) => ensureNumber(point.values?.[matchedKey]) ?? 0);
  });

  // 모든 키가 매칭되지 않으면 빈 차트 표시
  if (matchedKeys.length === 0) {
    console.warn(
      `그래프 '${
        graph.name || "Unknown"
      }'의 모든 컬럼을 찾을 수 없습니다. 사용 가능한 키:`,
      availableKeys
    );
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
        컬럼을 찾을 수 없습니다.
      </div>
    );
  }

  // null이 아닌 시리즈만 필터링
  const validSeriesData = seriesData.filter(
    (data): data is number[] => data !== null
  );
  const validLegends = config.legends.filter(
    (_, index) => seriesData[index] !== null
  );

  // y축 범위를 데이터에 맞게 자동 조정 (최소값은 0으로 고정)
  const allValues = validSeriesData.flat();
  if (allValues.length === 0) {
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
  const minValue = Math.min(...allValues.filter((v) => Number.isFinite(v)));
  const maxValue = Math.max(...allValues.filter((v) => Number.isFinite(v)));
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <LineChart
      legends={validLegends}
      categories={categories}
      seriesData={validSeriesData}
      showLegend={validLegends.length > 1}
      yMin={0}
      yMax={maxValue + padding}
    />
  );
};

const renderStack = (
  graph: GraphDataResponse,
  labels: string[],
  keys: string[]
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
  valueKeys: string[]
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
      colorRules={[{ min: 0, max: 100, color: "#3B82F6" }]}
      tooltipFormatter={({ used, total, percent }) =>
        `CPU Time (ms): ${used.toLocaleString()}ms / Max: ${total.toLocaleString()}ms (${percent.toFixed(
          1
        )}%)`
      }
      height={200}
    />
  );
};

export const renderDynamicChart = (
  title: string,
  graph: GraphDataResponse | null | undefined,
  mode: DashboardMode = "LIVE"
): React.ReactNode => {
  if (!graph) return null;

  // Graph ID 8: 세션 한도/급증
  // GraphRegistry: session_usage_pct
  if (graph.id === 8) {
    return renderGauge(graph, "session_usage_pct");
  }

  if (title.includes("PGA / SGA")) {
    return renderMetricTiles(graph, [
      { key: "workarea_spill_rate_pct", label: "Spill Rate %", suffix: "%" },
      { key: "spill_mb_per_min", label: "Spill MB/min" },
      { key: "hard_parses_per_sec", label: "Hard Parses/s" },
      {
        key: "library_cache_reloads_per_sec",
        label: "Library Cache Reloads/s",
      },
    ]);
  }

  if (title.includes("백그라운드 프로세스")) {
    return renderBackgroundMetrics(graph);
  }

  // Graph ID 3: Wait Class 분포
  // GraphRegistry: WAIT_CLASS_AAS_USER_IO, WAIT_CLASS_AAS_COMMIT, WAIT_CLASS_AAS_CONCURRENCY,
  //                WAIT_CLASS_AAS_SYSTEM_IO, WAIT_CLASS_AAS_NETWORK, WAIT_CLASS_AAS_CLUSTER, WAIT_CLASS_AAS_OTHER, AAS_TOTAL
  if (graph.id === 3) {
    return renderLine(
      graph,
      {
        keys: [
          "wait_class_aas_user_io",
          "wait_class_aas_commit",
          "wait_class_aas_concurrency",
          "wait_class_aas_system_io",
          "wait_class_aas_network",
          "wait_class_aas_cluster",
          "wait_class_aas_other",
        ],
        legends: [
          "User I/O",
          "Commit",
          "Concurrency",
          "System I/O",
          "Network",
          "Cluster",
          "Other",
        ],
      },
      mode
    );
  }

  // Graph ID 4: CPU 사용(호스트 vs DB CPU)
  // GraphRegistry: HOST_CPU_UTIL_PCT, CPU_SATURATION_PCT
  if (graph.id === 4) {
    return renderLine(
      graph,
      {
        keys: ["host_cpu_util_pct", "cpu_saturation_pct"],
        legends: ["Host CPU Util (%)", "CPU Saturation (%)"],
      },
      mode
    );
  }

  if (title.includes("제한 근접")) {
    return renderLine(
      graph,
      {
        keys: [
          "processes_usage_pct",
          "sessions_usage_pct",
          "open_cursors_max_session_pct",
        ],
        legends: ["processes", "sessions", "open_cursors"],
      },
      mode
    );
  }

  if (title.includes("I/O 지연량")) {
    return renderLine(
      graph,
      {
        keys: [
          "single_block_read_latency_ms",
          "direct_path_read_latency_ms",
          "direct_path_write_latency_ms",
        ],
        legends: ["Single Read (ms)", "Direct Read (ms)", "Direct Write (ms)"],
      },
      mode
    );
  }

  if (title.includes("I/O 처리량")) {
    return renderLine(
      graph,
      {
        keys: ["physical_read_mb_per_sec", "physical_write_mb_per_sec"],
        legends: ["Read MB/s", "Write MB/s"],
      },
      mode
    );
  }

  // Graph ID 7: SGA 압박(FreeMB/Reloads)
  // GraphRegistry: LIBRARY_CACHE_HIT_PCT, DICTIONARY_CACHE_HIT_PCT, HARD_PARSE_RATIO_PCT
  if (graph.id === 7) {
    return renderMetricTiles(graph, [
      {
        key: "library_cache_hit_pct",
        label: "Library Cache Hit (%)",
        suffix: "%",
      },
      {
        key: "dictionary_cache_hit_pct",
        label: "Dictionary Cache Hit (%)",
        suffix: "%",
      },
      {
        key: "hard_parse_ratio_pct",
        label: "Hard Parse Ratio (%)",
        suffix: "%",
      },
    ]);
  }

  if (title.includes("아카이브 로그")) {
    return renderGauge(graph, "fra_usage_pct");
  }

  // Graph ID 2: AAS
  // GraphRegistry: AAS_TOTAL, AAS_ONCPU_SESSIONS, CORE_BASELINE_SESSIONS
  if (graph.id === 2) {
    return renderLine(
      graph,
      {
        keys: ["aas_total", "aas_oncpu_sessions", "core_baseline_sessions"],
        legends: ["AAS Total", "AAS On-CPU Sessions", "Core Baseline Sessions"],
      },
      mode
    );
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
      ]
    );
  }

  // === CPU 카테고리 (그래프 ID 기반 매칭) ===
  // Graph ID 13: CPU 활동 현황 타일
  // GraphRegistry: HOST_BUSY_CORES, HOST_TOTAL_CORES, HOST_CPU_UTIL_PCT, AAS_ONCPU_SESSIONS, CORE_BASELINE_SESSIONS,
  //                CPU_SATURATION_PCT, DB_OF_HOST_SHARE_PCT, RunQ_per_Core_LOAD_PROXY, TPS_PER_SEC, EXECS_PER_SEC
  if (graph.id === 13) {
    return renderMetricTiles(
      graph,
      [
        { key: "host_cpu_util_pct", label: "Host CPU(%)", suffix: "%" },
        {
          key: "cpu_saturation_pct",
          label: "DB CPU Saturation(%)",
          suffix: "%",
        },
        {
          key: "db_of_host_share_pct",
          label: "DB Share of Host(%)",
          suffix: "%",
        },
        {
          key: "runq_per_core_load_proxy",
          label: "Run Queue per Core(process)",
        },
        { key: "tps_per_sec", label: "TPS" },
        { key: "execs_per_sec", label: "EXEC/S" },
        { key: "user_calls_per_sec", label: "USER CALLS/S" },
      ],
      7
    );
  }

  // Graph ID 19: Foreground vs Background CPU 추이
  if (graph.id === 19) {
    return renderLine(
      graph,
      {
        keys: ["aas_fg_sessions", "aas_bg_sessions"],
        legends: ["Foreground AAS", "Background AAS"],
      },
      mode
    );
  }

  // Graph ID 15: Host CPU Utilization
  if (graph.id === 15) {
    return renderLine(
      graph,
      {
        keys: ["host_cpu_util_pct"],
        legends: ["Host CPU Util (%)"],
      },
      mode
    );
  }

  // Graph ID 14: DB CPU Saturation - AAS vs Core
  // GraphRegistry: AAS_ONCPU_SESSIONS, CORE_BASELINE_SESSIONS
  if (graph.id === 14) {
    return renderLine(
      graph,
      {
        keys: ["aas_oncpu_sessions", "core_baseline_sessions"],
        legends: ["AAS On-CPU Sessions", "Core Baseline Sessions"],
      },
      mode
    );
  }

  // Graph ID 16: DB CPU Share of Host
  // GraphRegistry: DB_OF_HOST_SHARE_PCT, OTHER_PROCESSES_PCT
  if (graph.id === 16) {
    return renderLine(
      graph,
      {
        keys: ["db_of_host_share_pct", "other_processes_pct"],
        legends: ["DB CPU Share (%)", "Other Processes (%)"],
      },
      mode
    );
  }

  // Graph ID 18: CPU Cost per Commit/Execution
  if (graph.id === 18) {
    return renderLine(
      graph,
      {
        keys: ["cpu_per_commit_ms", "cpu_per_exec_ms"],
        legends: ["CPU per Commit (ms)", "CPU per Exec (ms)"],
      },
      mode
    );
  }

  // Graph ID 17: Run Queue per Core - Scheduler Load
  // GraphRegistry: RunQ_per_Core_LOAD_PROXY, Load_threshold, load_threshold_min, load_threshold_max
  if (graph.id === 17) {
    return renderLine(
      graph,
      {
        keys: [
          "runq_per_core_load_proxy",
          "load_threshold",
          "load_threshold_min",
          "load_threshold_max",
        ],
        legends: [
          "Run Queue per Core",
          "Load Threshold",
          "Load Threshold Min",
          "Load Threshold Max",
        ],
      },
      mode
    );
  }

  // Graph ID 20: Top SQL by CPU (Type 5 = Timeline)
  // 타입이 5번이면 Timeline으로 렌더링, 아니면 기존 로직 유지
  if (graph.id === 20) {
    // 타입이 5번(Timeline)이면 mainChartRenderer로 위임
    if (graph.type === 5) {
      return null; // mainChartRenderer에서 처리하도록
    }
    // 타입이 5번이 아니면 기존 StackChart 방식 유지
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
      ]
    );
  }

  // === MEMORY 카테고리 ===
  if (title.includes("PGA Execution Memory") && title.includes("Processes")) {
    return renderMetricTiles(
      graph,
      [
        { key: "pga_used_bytes", label: "PGA Used (bytes)" },
        { key: "pga_target_bytes", label: "PGA Target (bytes)" },
        { key: "pga_util_pct", label: "PGA Util (%)", suffix: "%" },
        { key: "memory_sort_pct", label: "Memory Sort (%)", suffix: "%" },
        { key: "dedicated_sess_cnt", label: "Dedicated" },
        { key: "parallel_proc_cnt", label: "Parallel" },
        { key: "shared_server_proc_cnt", label: "Shared" },
        { key: "dispatcher_proc_cnt", label: "Dispatcher" },
        { key: "job_proc_cnt", label: "Job" },
      ],
      3
    );
  }

  if (title.includes("SGA Efficiency") && title.includes("Memory Pools")) {
    return renderMetricTiles(
      graph,
      [
        { key: "sga_util_pct", label: "SGA Usage", suffix: "%" },
        { key: "shared_pool_free_pct", label: "Shared Pool", suffix: "%" },
        { key: "library_cache_mb", label: "Lib.Cache", suffix: " MB" },
        { key: "dictionary_cache_mb", label: "Dic.Cache", suffix: " MB" },
        { key: "large_pool_mb", label: "Large Pool", suffix: " MB" },
        { key: "java_pool_mb", label: "Java Pool", suffix: " MB" },
        { key: "log_buffer_mb", label: "Log Buffer", suffix: " MB" },
        { key: "buffer_cache_mb", label: "Buffer Cache", suffix: " MB" },
      ],
      4
    );
  }

  // Graph ID 23: PGA Utilization (%) – Trend
  // GraphRegistry: PGA_UTIL_PCT
  if (graph.id === 23) {
    return renderLine(
      graph,
      {
        keys: ["pga_util_pct"],
        legends: ["PGA Utilization (%)"],
      },
      mode
    );
  }

  // Graph ID 24: SGA Utilization (%) — Trend
  // GraphRegistry: SGA_UTIL_PCT
  if (graph.id === 24) {
    return renderLine(
      graph,
      {
        keys: ["sga_util_pct"],
        legends: ["SGA Utilization (%)"],
      },
      mode
    );
  }

  if (title.includes("Workarea Spill Rate") && title.includes("Trend")) {
    return renderLine(
      graph,
      {
        keys: ["workarea_spill_rate_pct"],
        legends: ["Spill Rate (%)"],
      },
      mode
    );
  }

  if (
    title.includes("Library Cache Reloads per Second") &&
    title.includes("Trend")
  ) {
    return renderLine(
      graph,
      {
        keys: ["library_cache_reloads_per_sec"],
        legends: ["Reloads/s"],
      },
      mode
    );
  }

  if (title.includes("Buffer Cache Miss Rate") && title.includes("Proxy")) {
    return renderLine(
      graph,
      {
        keys: ["buffer_miss_pct"],
        legends: ["Miss Rate (%)"],
      },
      mode
    );
  }

  // === SESSION 카테고리 ===
  if (
    title.includes("Active vs Inactive Sessions") &&
    title.includes("Trend")
  ) {
    return renderLine(
      graph,
      {
        keys: ["active_user_sessions_now", "inactive_user_sessions_now"],
        legends: ["Active", "Inactive"],
      },
      mode
    );
  }

  if (title.includes("On-CPU vs Wait") && title.includes("AAS 분해")) {
    return renderLine(
      graph,
      {
        keys: ["aas_oncpu_sessions", "aas_wait_sessions"],
        legends: ["On-CPU", "Wait"],
      },
      mode
    );
  }

  if (
    title.includes("Lock Wait Sessions") &&
    (title.includes("TX") || title.includes("TM"))
  ) {
    return renderLine(
      graph,
      {
        keys: ["lock_wait_tx", "lock_wait_tm", "lock_wait_total"],
        legends: ["TX", "TM", "Total"],
      },
      mode
    );
  }

  if (title.includes("TPS") && title.includes("Trend")) {
    return renderLine(
      graph,
      {
        keys: ["tps_per_sec"],
        legends: ["TPS"],
      },
      mode
    );
  }

  if (title.includes("Exec/s") && title.includes("Trend")) {
    return renderLine(
      graph,
      {
        keys: ["execs_per_sec"],
        legends: ["Exec/s"],
      },
      mode
    );
  }

  if (title.includes("Logons/sec") || title.includes("Disconnects/sec")) {
    return renderLine(
      graph,
      {
        keys: ["logons_per_sec", "disconnects_per_sec"],
        legends: ["Logons/s", "Disconnects/s"],
      },
      mode
    );
  }

  if (
    title.includes("Session Activity") &&
    title.includes("Resource Summary")
  ) {
    return renderMetricTiles(
      graph,
      [
        { key: "active_user_sessions_now", label: "Active / Total Users" },
        {
          key: "sessions_limit_util_pct",
          label: "Sessions Limit Util(%)",
          suffix: "%",
        },
        {
          key: "processes_limit_util_pct",
          label: "Processes Limit Util(%)",
          suffix: "%",
        },
        { key: "blockers_now", label: "Blockers(session)" },
        { key: "blocked_now", label: "Blocked(session)" },
      ],
      5
    );
  }

  // === I/O 카테고리 ===
  // Graph ID 37: I/O Performance Dashboard
  // GraphRegistry: cache_hit_ratio_pct, avg_io_wait_time_ms, physical_reads_per_sec, redo_size_mb_per_sec, parse_execute_ratio, direct_path_io_per_sec
  if (graph.id === 37) {
    return renderMetricTiles(
      graph,
      [
        {
          key: "cache_hit_ratio_pct",
          label: "Cache Hit Ratio(%)",
          suffix: "%",
        },
        {
          key: "avg_io_wait_time_ms",
          label: "Avg I/O Wait Time(ms)",
          suffix: " ms",
        },
        { key: "physical_reads_per_sec", label: "Physical Reads(/s)" },
        {
          key: "redo_size_mb_per_sec",
          label: "Redo Size(MB/s)",
          suffix: " MB/s",
        },
        { key: "parse_execute_ratio", label: "Parse/Execute Ratio" },
        { key: "direct_path_io_per_sec", label: "Direct Path I/O(/s)" },
      ],
      6
    );
  }

  // Graph ID 38: Direct Path I/O (개/초)
  // GraphRegistry: physical_reads_direct_per_sec, physical_writes_direct_per_sec, direct_io_ratio_pct
  if (graph.id === 38) {
    return renderLine(
      graph,
      {
        keys: [
          "physical_reads_direct_per_sec",
          "physical_writes_direct_per_sec",
          "direct_io_ratio_pct",
        ],
        legends: [
          "Physical Reads Direct (/s)",
          "Physical Writes Direct (/s)",
          "Direct I/O Ratio (%)",
        ],
      },
      mode
    );
  }

  // Graph ID 39: SQL Parsing & Execution (개/초)
  // GraphRegistry: parser_request_per_sec, sql_execute_per_sec, sql_parse_execute_ratio
  if (graph.id === 39) {
    return renderLine(
      graph,
      {
        keys: [
          "parser_request_per_sec",
          "sql_execute_per_sec",
          "sql_parse_execute_ratio",
        ],
        legends: [
          "Parser Request (/s)",
          "SQL Execute (/s)",
          "Parse/Execute Ratio",
        ],
      },
      mode
    );
  }

  // Graph ID 40: Physical Reads vs Logical Reads (개/초)
  // GraphRegistry: physical_reads_per_diff_sec, logical_reads_per_sec, cache_hit_ratio_diff_pct, total_reads_per_sec
  if (graph.id === 40) {
    return renderLine(
      graph,
      {
        keys: [
          "physical_reads_per_diff_sec",
          "logical_reads_per_sec",
          "cache_hit_ratio_diff_pct",
          "total_reads_per_sec",
        ],
        legends: [
          "Physical Reads (/s)",
          "Logical Reads (/s)",
          "Cache Hit Ratio Diff (%)",
          "Total Reads (/s)",
        ],
      },
      mode
    );
  }

  // Graph ID 41: Average I/O Wait Time (ms)
  // GraphRegistry: avg_wait_time_ms, p95_wait_time_ms, io_waits_per_sec, io_time_per_sec_ms
  if (graph.id === 41) {
    return renderLine(
      graph,
      {
        keys: [
          "avg_wait_time_ms",
          "p95_wait_time_ms",
          "io_waits_per_sec",
          "io_time_per_sec_ms",
        ],
        legends: [
          "Avg Wait Time (ms)",
          "P95 Wait Time (ms)",
          "I/O Waits (/s)",
          "I/O Time (/s ms)",
        ],
      },
      mode
    );
  }

  // Graph ID 42: Redo Generation Rate (MB/초)
  // GraphRegistry: redo_generation_mbps, redo_generation_mbps_total, redo_generation_24h_avg, log_switch_count_1min, log_switch_count_5min
  if (graph.id === 42) {
    return renderLine(
      graph,
      {
        keys: [
          "redo_generation_mbps",
          "redo_generation_mbps_total",
          "redo_generation_24h_avg",
          "log_switch_count_1min",
          "log_switch_count_5min",
        ],
        legends: [
          "Redo Generation (MB/s)",
          "Redo Total (MB/s)",
          "Redo 24h Avg (MB/s)",
          "Log Switch 1min",
          "Log Switch 5min",
        ],
      },
      mode
    );
  }

  // === STORAGE 카테고리 ===
  // Graph ID 45: Storage Health Dashboard
  // GraphRegistry: FRA_USAGE_PERCENT, FRA_FREE_GB, UNDO_USAGE_PCT, TEMP_USAGE_PCT, MAX_TS_NAME, MAX_TS_USAGE_PCT, TOTAL_DB_USAGE_PCT
  if (graph.id === 45) {
    return renderMetricTiles(
      graph,
      [
        { key: "fra_usage_percent", label: "FRA Usage(%)", suffix: "%" },
        { key: "fra_free_gb", label: "FRA Free(GB)", suffix: " GB" },
        { key: "undo_usage_pct", label: "Undo Usage(%)", suffix: "%" },
        { key: "temp_usage_pct", label: "Temp Usage(%)", suffix: "%" },
        { key: "max_ts_name", label: "Max TS Name" },
        { key: "max_ts_usage_pct", label: "Max TS Usage(%)", suffix: "%" },
        { key: "total_db_usage_pct", label: "Total DB Usage(%)", suffix: "%" },
      ],
      7
    );
  }

  // Graph ID 46: Temp Tablespace Active Usage (GB)
  // GraphRegistry: temp_active_usage_gb, temp_current_size_gb, temp_max_size_gb, temp_usage_percent, temp_usage_pct_of_max, temp_peak_usage_24h_gb
  if (graph.id === 46) {
    return renderLine(
      graph,
      {
        keys: [
          "temp_active_usage_gb",
          "temp_current_size_gb",
          "temp_max_size_gb",
          "temp_usage_percent",
          "temp_usage_pct_of_max",
          "temp_peak_usage_24h_gb",
        ],
        legends: [
          "Active Usage (GB)",
          "Current Size (GB)",
          "Max Size (GB)",
          "Usage (%)",
          "Usage of Max (%)",
          "Peak 24h (GB)",
        ],
      },
      mode
    );
  }

  // Graph ID 47: 테이블스페이스 사용률 추세 (%)
  // GraphRegistry: system_tablespace_name, sysaux_tablespace_name, undotbs1_tablespace_name, users_tablespace_name,
  //                system_used_percent, sysaux_used_percent, undotbs1_used_percent, users_used_percent
  if (graph.id === 47) {
    return renderLine(
      graph,
      {
        keys: [
          "system_used_percent",
          "sysaux_used_percent",
          "undotbs1_used_percent",
          "users_used_percent",
        ],
        legends: ["SYSTEM", "SYSAUX", "UNDOTBS1", "USERS"],
      },
      mode
    );
  }

  // Graph ID 48: 테이블스페이스 증가 추세 (GB/일)
  // GraphRegistry: system_tablespace_name_inc, sysaux_tablespace_name_inc, undotbs1_tablespace_name_inc, users_tablespace_name_inc,
  //                system_used_space_gb_inc, sysaux_used_space_gb_inc, undotbs1_used_space_gb_inc, users_used_space_gb_inc
  if (graph.id === 48) {
    return renderStack(
      graph,
      ["SYSTEM", "SYSAUX", "UNDOTBS1", "USERS"],
      [
        "system_used_space_gb_inc",
        "sysaux_used_space_gb_inc",
        "undotbs1_used_space_gb_inc",
        "users_used_space_gb_inc",
      ]
    );
  }

  // Graph ID 49: FRA 사용률 추세 (%)
  // GraphRegistry: space_limit_gb, space_used_gb, space_reclaimable_gb, usage_pct, hourly_growth_pct, time_to_95_pct_hours
  if (graph.id === 49) {
    return renderLine(
      graph,
      {
        keys: [
          "space_limit_gb",
          "space_used_gb",
          "space_reclaimable_gb",
          "usage_pct",
          "hourly_growth_pct",
          "time_to_95_pct_hours",
        ],
        legends: [
          "Space Limit (GB)",
          "Space Used (GB)",
          "Space Reclaimable (GB)",
          "Usage (%)",
          "Hourly Growth (%)",
          "Time to 95% (hours)",
        ],
      },
      mode
    );
  }

  // Graph ID 50: Undo 사용률 추세 (%)
  // GraphRegistry: undo_tablespace_name, undo_usage_percent, long_transaction_count, long_transaction_undo_mb, undo_retention_sec
  if (graph.id === 50) {
    return renderLine(
      graph,
      {
        keys: [
          "undo_tablespace_name",
          "undo_usage_percent",
          "long_transaction_count",
          "long_transaction_undo_mb",
          "undo_retention_sec",
        ],
        legends: [
          "Undo TS Name",
          "Undo Usage (%)",
          "Long Transaction Count",
          "Long Transaction Undo (MB)",
          "Undo Retention (sec)",
        ],
      },
      mode
    );
  }

  // Graph ID 51: Total Database Usage Trend (%)
  // GraphRegistry: total_db_usage_percent
  if (graph.id === 51) {
    return renderLine(
      graph,
      {
        keys: ["total_db_usage_percent"],
        legends: ["Total Usage (%)"],
      },
      mode
    );
  }

  // 위의 조건들에 매칭되지 않으면 타입 기반으로 렌더링 시도
  if (graph.type != null) {
    const rendered = mainChartRenderer(title, graph, mode);
    // mainChartRenderer가 null을 반환하지 않도록 보장
    if (rendered) {
      return rendered;
    }
  }

  // 모든 조건에 매칭되지 않으면 빈 차트 표시
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
      데이터를 불러오는 중입니다...
    </div>
  );
};
