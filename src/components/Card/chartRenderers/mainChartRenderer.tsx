import React from "react";
import GaugeChart from "@/components/Chart/GaugeChart";
import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
import TimelineChart from "@/components/Chart/TimelineChart";
import DonutChart from "@/components/Chart/DonutChart";
import TableChart from "@/components/Chart/TableChart";
import MixedChart from "@/components/Chart/MixedChart";
import MetricGrid from "@/components/Card/MetricCard";
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

const formatColumnName = (key: string): string => {
  // 대소문자 무시 매칭을 위한 정규화
  const normalizedKey = key.toLowerCase();
  
  const map: Record<string, string> = {
    // CPU 관련
    host_cpu_util_pct: "Host CPU Util (%)",
    db_of_host_share_pct: "DB CPU Share (%)",
    cpu_saturation_pct: "CPU Saturation (%)",
    cpu_per_commit_ms: "CPU per Commit (ms)",
    cpu_per_exec_ms: "CPU per Exec (ms)",
    runq_per_core_load_proxy: "Run Queue per Core",
    run_q_per_core_load_proxy: "Run Queue per Core",
    load_threshold: "Load Threshold",
    load_threshold_min: "Load Threshold Min",
    load_threshold_max: "Load Threshold Max",
    aas_fg_sessions: "Foreground AAS",
    aas_bg_sessions: "Background AAS",
    aas_oncpu_sessions: "AAS On-CPU Sessions",
    aas_wait_sessions: "AAS Wait Sessions",
    core_baseline_sessions: "Core Baseline Sessions",
    other_processes_pct: "Other Processes (%)",
    
    // AAS 관련
    aas_total: "AAS Total",
    
    // Wait Class 관련
    wait_class_aas_user_io: "User I/O",
    wait_class_aas_commit: "Commit",
    wait_class_aas_concurrency: "Concurrency",
    wait_class_aas_system_io: "System I/O",
    wait_class_aas_network: "Network",
    wait_class_aas_cluster: "Cluster",
    wait_class_aas_other: "Other",
    
    // Memory 관련
    workarea_spill_rate_pct: "Spill Rate %",
    spill_mb_per_min: "Spill MB/min",
    hard_parses_per_sec: "Hard Parses/s",
    library_cache_reloads_per_sec: "Library Cache Reloads/s",
    library_cache_hit_pct: "Library Cache Hit (%)",
    dictionary_cache_hit_pct: "Dictionary Cache Hit (%)",
    hard_parse_ratio_pct: "Hard Parse Ratio (%)",
    pga_util_pct: "PGA Utilization (%)",
    sga_util_pct: "SGA Utilization (%)",
    buffer_miss_pct: "Buffer Cache Miss (%)",
    shared_pool_free_bytes: "Shared Pool Free (bytes)",
    shared_pool_free_pct: "Shared Pool Free (%)",
    
    // I/O 관련
    single_block_read_latency_ms: "Single Read (ms)",
    direct_path_read_latency_ms: "Direct Read (ms)",
    direct_path_write_latency_ms: "Direct Write (ms)",
    physical_read_mb_per_sec: "Read MB/s",
    physical_write_mb_per_sec: "Write MB/s",
    cache_hit_ratio_pct: "Cache Hit Ratio (%)",
    avg_io_wait_time_ms: "Avg I/O Wait Time (ms)",
    physical_reads_per_sec: "Physical Reads (/s)",
    redo_size_mb_per_sec: "Redo Size (MB/s)",
    parse_execute_ratio: "Parse/Execute Ratio",
    direct_path_io_per_sec: "Direct Path I/O (/s)",
    physical_reads_direct_per_sec: "Physical Reads Direct (/s)",
    physical_writes_direct_per_sec: "Physical Writes Direct (/s)",
    direct_io_ratio_pct: "Direct I/O Ratio (%)",
    parser_request_per_sec: "Parser Request (/s)",
    sql_execute_per_sec: "SQL Execute (/s)",
    sql_parse_execute_ratio: "Parse/Execute Ratio",
    physical_reads_per_diff_sec: "Physical Reads (/s)",
    logical_reads_per_sec: "Logical Reads (/s)",
    cache_hit_ratio_diff_pct: "Cache Hit Ratio Diff (%)",
    total_reads_per_sec: "Total Reads (/s)",
    avg_wait_time_ms: "Avg Wait Time (ms)",
    p95_wait_time_ms: "P95 Wait Time (ms)",
    io_waits_per_sec: "I/O Waits (/s)",
    io_time_per_sec_ms: "I/O Time (/s ms)",
    redo_generation_mbps: "Redo Generation (MB/s)",
    redo_generation_mbps_total: "Redo Total (MB/s)",
    redo_generation_24h_avg: "Redo 24h Avg (MB/s)",
    log_switch_count_1min: "Log Switch 1min",
    log_switch_count_5min: "Log Switch 5min",
    
    // Session 관련
    sessions_limit_util_pct: "Session Util (%)",
    session_usage_pct: "Session Usage (%)",
    processes_usage_pct: "Processes Usage (%)",
    sessions_usage_pct: "Sessions Usage (%)",
    open_cursors_max_session_pct: "Open Cursors Max Session (%)",
    active_user_sessions_now: "Active Sessions",
    inactive_user_sessions_now: "Inactive Sessions",
    lock_wait_tx: "Lock Wait TX",
    lock_wait_tm: "Lock Wait TM",
    lock_wait_total: "Lock Wait Total",
    tps_per_sec: "TPS",
    execs_per_sec: "Exec/s",
    logons_per_sec: "Logons/s",
    disconnects_per_sec: "Disconnects/s",
    
    // Storage 관련
    fra_usage_pct: "FRA Usage (%)",
    fra_usage_percent: "FRA Usage (%)",
    fra_free_gb: "FRA Free (GB)",
    undo_usage_pct: "Undo Usage (%)",
    undo_usage_percent: "Undo Usage (%)",
    temp_usage_pct: "Temp Usage (%)",
    temp_active_usage_gb: "Temp Active Usage (GB)",
    temp_current_size_gb: "Temp Current Size (GB)",
    temp_max_size_gb: "Temp Max Size (GB)",
    temp_usage_percent: "Temp Usage (%)",
    temp_usage_pct_of_max: "Temp Usage of Max (%)",
    temp_peak_usage_24h_gb: "Temp Peak 24h (GB)",
    system_used_percent: "SYSTEM Used (%)",
    sysaux_used_percent: "SYSAUX Used (%)",
    undotbs1_used_percent: "UNDOTBS1 Used (%)",
    users_used_percent: "USERS Used (%)",
    system_used_space_gb_inc: "SYSTEM Growth (GB/day)",
    sysaux_used_space_gb_inc: "SYSAUX Growth (GB/day)",
    undotbs1_used_space_gb_inc: "UNDOTBS1 Growth (GB/day)",
    users_used_space_gb_inc: "USERS Growth (GB/day)",
    space_limit_gb: "Space Limit (GB)",
    space_used_gb: "Space Used (GB)",
    space_reclaimable_gb: "Space Reclaimable (GB)",
    usage_pct: "Usage (%)",
    hourly_growth_pct: "Hourly Growth (%)",
    time_to_95_pct_hours: "Time to 95% (hours)",
    undo_tablespace_name: "Undo TS Name",
    long_transaction_count: "Long Transaction Count",
    long_transaction_undo_mb: "Long Transaction Undo (MB)",
    undo_retention_sec: "Undo Retention (sec)",
    total_db_usage_pct: "Total DB Usage (%)",
    total_db_usage_percent: "Total DB Usage (%)",
    max_ts_name: "Max TS Name",
    max_ts_usage_pct: "Max TS Usage (%)",
  };

  return map[normalizedKey] ?? key;
};

const renderEmptyChart = (type?: number) => {
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: "0.85rem",
  };

  if (type === 7) {
    return (
      <div style={style}>
        표시할 메트릭이 없습니다.
      </div>
    );
  }

  return (
    <div style={style}>
      데이터가 없습니다.
    </div>
  );
};

const formatTimeByMode = (timestamp: string, mode: DashboardMode = "LIVE") => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  
  switch (mode) {
    case "LIVE": {
      // 24시간 형식으로 포맷팅 (HH:mm)
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    case "10분":
    case "1시간":
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "1일":
      return date.toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    default: {
      // 24시간 형식으로 포맷팅 (HH:mm)
      const defaultHours = String(date.getHours()).padStart(2, "0");
      const defaultMinutes = String(date.getMinutes()).padStart(2, "0");
      return `${defaultHours}:${defaultMinutes}`;
    }
  }
};

const renderLineChart = (graphData: GraphDataResponse, mode: DashboardMode = "LIVE") => {
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return ta - tb;
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);

  const keys = Object.keys(sorted[0].values ?? {});
  if (!keys.length) return renderEmptyChart(graphData.type);

  const categories = sorted.map((point) => formatTimeByMode(point.timestamp ?? "", mode));

  const legends = keys.map(formatColumnName);
  const seriesData = keys.map((key) =>
    sorted.map((point) => ensureNumber(point.values?.[key]) ?? 0),
  );

  // y축 범위를 데이터에 맞게 자동 조정 (최소값은 0으로 고정)
  const allValues = seriesData.flat();
  const minValue = Math.min(...allValues.filter(v => Number.isFinite(v)));
  const maxValue = Math.max(...allValues.filter(v => Number.isFinite(v)));
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <LineChart
      legends={legends}
      categories={categories}
      seriesData={seriesData}
      showLegend={legends.length > 1}
      yMin={0}
      yMax={maxValue + padding}
    />
  );
};

const renderGauge = (graphData: GraphDataResponse) => {
  // 타임스탬프 기준으로 내림차순 정렬 (가장 최근 데이터가 첫 번째)
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return tb - ta; // 내림차순 정렬 (최신이 먼저)
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);

  // 가장 최근 데이터 (정렬 후 첫 번째)
  const latest = sorted[0];
  const keys = Object.keys(latest.values ?? {});
  const numericKey = keys.find((key) => ensureNumber(latest.values?.[key]) !== null);

  if (!numericKey) return renderEmptyChart(graphData.type);

  const value = ensureNumber(latest.values?.[numericKey]) ?? 0;
  return <GaugeChart value={value} />;
};

const renderMetricCard = (graphData: GraphDataResponse) => {
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return ta - tb;
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);

  const latest = sorted[sorted.length - 1];
  const entries = Object.entries(latest.values ?? {});
  if (!entries.length) return renderEmptyChart(graphData.type);

  const metrics = entries.map(([key, raw]) => {
    const value = ensureNumber(raw);
    return {
      title: formatColumnName(key),
      value:
        value !== null
          ? Number.isInteger(value)
            ? value.toLocaleString()
            : value.toFixed(2)
          : typeof raw === "string"
            ? raw
            : "-",
    };
  });

  return (
    <MetricGrid
      metrics={metrics}
      columns={Math.min(Math.max(metrics.length, 1), 3)}
      height={190}
    />
  );
};

const renderStack = (graphData: GraphDataResponse) => {
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return ta - tb;
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);
  const latest = sorted[sorted.length - 1];
  const entries = Object.entries(latest.values ?? {});
  if (!entries.length) return renderEmptyChart(graphData.type);

  const labels = entries.map(([key]) => formatColumnName(key));
  const usage = entries.map(([, value]) => ensureNumber(value) ?? 0);
  const totals = entries.map(() => 100);

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
    />
  );
};

const renderTimeline = (graphData: GraphDataResponse, mode: DashboardMode = "LIVE") => {
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return ta - tb;
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);

  const keys = Object.keys(sorted[0].values ?? {});
  if (!keys.length) return renderEmptyChart(graphData.type);

  const categories = sorted.map((point) => formatTimeByMode(point.timestamp ?? "", mode));
  const legends = keys.map(formatColumnName);
  const seriesData = keys.map((key) =>
    sorted.map((point) => ensureNumber(point.values?.[key]) ?? 0),
  );

  // y축 범위를 데이터에 맞게 자동 조정 (최소값은 0으로 고정)
  const allValues = seriesData.flat();
  const minValue = Math.min(...allValues.filter(v => Number.isFinite(v)));
  const maxValue = Math.max(...allValues.filter(v => Number.isFinite(v)));
  const padding = (maxValue - minValue) * 0.1 || 1;

  return (
    <TimelineChart
      legends={legends}
      categories={categories}
      seriesData={seriesData}
      showLegend={legends.length > 1}
      yMin={0}
      yMax={maxValue + padding}
    />
  );
};

const renderDonut = (graphData: GraphDataResponse) => {
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return tb - ta; // 내림차순 정렬 (최신이 먼저)
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);

  const latest = sorted[0];
  const entries = Object.entries(latest.values ?? {});
  if (!entries.length) return renderEmptyChart(graphData.type);

  const labels = entries.map(([key]) => formatColumnName(key));
  const series = entries.map(([, value]) => ensureNumber(value) ?? 0);

  // 총합 대비 비율로 변환
  const total = series.reduce((a, b) => a + b, 0);
  const percentages = total > 0 ? series.map(v => (v / total) * 100) : series;

  return (
    <DonutChart
      labels={labels}
      series={percentages}
    />
  );
};

const renderTable = (graphData: GraphDataResponse) => {
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return tb - ta; // 내림차순 정렬 (최신이 먼저)
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);

  const latest = sorted[0];
  const entries = Object.entries(latest.values ?? {});
  if (!entries.length) return renderEmptyChart(graphData.type);

  const columns = [
    { key: "name", label: "항목" },
    { key: "value", label: "값" },
  ];

  const rows = entries.map(([key, value]) => {
    const formattedValue = ensureNumber(value);
    return [
      formatColumnName(key),
      formattedValue !== null
        ? Number.isInteger(formattedValue)
          ? formattedValue.toLocaleString()
          : formattedValue.toFixed(2)
        : typeof value === "string"
          ? value
          : "-",
    ];
  });

  return <TableChart columns={columns} rows={rows} size="sm" />;
};

const renderLineColumn = (graphData: GraphDataResponse, mode: DashboardMode = "LIVE") => {
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return ta - tb;
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);

  const keys = Object.keys(sorted[0].values ?? {});
  if (keys.length < 2) return renderEmptyChart(graphData.type);

  const categories = sorted.map((point) => formatTimeByMode(point.timestamp ?? "", mode));
  
  // 첫 번째 키는 Column, 두 번째 키는 Line으로 사용
  const columnData = sorted.map((point) => ensureNumber(point.values?.[keys[0]]) ?? 0);
  const lineData = sorted.map((point) => ensureNumber(point.values?.[keys[1]]) ?? 0);

  return (
    <MixedChart
      categories={categories}
      columnData={columnData}
      lineData={lineData}
      yaxisLeftTitle={formatColumnName(keys[0])}
      yaxisRightTitle={formatColumnName(keys[1])}
    />
  );
};

export const mainChartRenderer = (
  _title: string,
  graphData?: GraphDataResponse | null,
  mode: DashboardMode = "LIVE",
): React.ReactNode => {
  if (!graphData) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
        데이터가 없습니다.
      </div>
    );
  }

  switch (graphData.type) {
    case 1: // Line
      return renderLineChart(graphData, mode);
    case 2: // Stack
      return renderStack(graphData);
    case 3: // Gauge
      return renderGauge(graphData);
    case 4: // Donut
      return renderDonut(graphData);
    case 5: // Timeline
      return renderTimeline(graphData, mode);
    case 6: // Table
      return renderTable(graphData);
    case 7: // Tile
      return renderMetricCard(graphData);
    case 8: // Line-Column
      return renderLineColumn(graphData, mode);
    default:
      return renderLineChart(graphData, mode);
  }
};
