import React from "react";
import GaugeChart from "@/components/Chart/GaugeChart";
import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
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
  const map: Record<string, string> = {
    host_cpu_util_pct: "Host CPU Util (%)",
    db_of_host_share_pct: "DB CPU Share (%)",
    aas_total: "AAS Total",
    workarea_spill_rate_pct: "Spill Rate %",
    library_cache_reloads_per_sec: "Library Cache Reloads/s",
    hard_parses_per_sec: "Hard Parses/s",
    spill_mb_per_min: "Spill MB/min",
    wait_class_aas_user_io: "User I/O",
    wait_class_aas_commit: "Commit",
    wait_class_aas_concurrency: "Concurrency",
    wait_class_aas_network: "Network",
    wait_class_aas_other: "Other",
    single_block_read_latency_ms: "Single Read (ms)",
    direct_path_read_latency_ms: "Direct Read (ms)",
    direct_path_write_latency_ms: "Direct Write (ms)",
    physical_read_mb_per_sec: "Read MB/s",
    physical_write_mb_per_sec: "Write MB/s",
    sessions_limit_util_pct: "Session Util (%)",
    fra_usage_pct: "FRA Usage (%)",
    shared_pool_free_bytes: "Shared Pool Free (bytes)",
  };

  return map[key] ?? key;
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
    case "LIVE":
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
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
    default:
      return date.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
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

  // y축 범위를 데이터에 맞게 자동 조정
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
      yMin={minValue - padding}
      yMax={maxValue + padding}
    />
  );
};

const renderGauge = (graphData: GraphDataResponse) => {
  const sorted = [...(graphData.data ?? [])].sort((a, b) => {
    const ta = new Date(a.timestamp ?? 0).getTime();
    const tb = new Date(b.timestamp ?? 0).getTime();
    return ta - tb;
  });

  if (!sorted.length) return renderEmptyChart(graphData.type);

  const latest = sorted[sorted.length - 1];
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
    case 1:
      return renderLineChart(graphData, mode);
    case 2:
      return renderStack(graphData);
    case 3:
    case 4:
      return renderGauge(graphData);
    case 7:
      return renderMetricCard(graphData);
    default:
      return renderLineChart(graphData, mode);
  }
};
