import LineChart from "@/components/Chart/LineChart";
import GaugeChart from "@/components/Chart/GaugeChart";
import StackChart from "@/components/Chart/StackChart";
import MetricCard from "@/components/Card/MetricCard";
import type { GraphDataResponse } from "@/api";

// Main Custom 탭 전용 차트 렌더러
export const mainChartRenderer = (
  title: string,
  graphData?: GraphDataResponse | null
) => {
  // graphData가 있고 데이터가 있으면 실제 데이터 사용
  if (graphData && graphData.data && graphData.data.length > 0) {
    return renderChartWithData(title, graphData);
  }

  // 데이터가 없어도 차트 영역(칸)은 유지하기 위해 빈 div 반환
  // graphData가 있으면 type 정보를 사용하여 빈 차트 구조 유지
  if (graphData) {
    return renderEmptyChart(graphData.type);
  }

  // graphData가 아예 없으면 빈 영역만 표시 (높이는 부모에 맞춤)
  return <div style={{ width: '100%', height: '100%' }}></div>;
};

// 빈 차트 렌더링 (차트 타입별로 적절한 빈 구조 유지)
const renderEmptyChart = (type?: number) => {
  // 그리드가 높이를 자동으로 조절하므로 minHeight 제거, 높이는 부모에 맞춤
  const emptyStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
  };

  return (
    <div style={emptyStyle}>
      데이터가 없습니다.
    </div>
  );
};

// 컬럼명을 읽기 좋게 변환
const formatColumnName = (key: string): string => {
  const nameMap: Record<string, string> = {
    sessions_limit_util_pct: "Session 사용률 (%)",
    host_cpu_util_pct: "Host CPU Utilization (%)",
    db_of_host_share_pct: "DB CPU Share of Host (%)",
    wait_class_aas_user_io: "User I/O",
    wait_class_aas_commit: "Commit",
    wait_class_aas_concurrency: "Concurrency",
    wait_class_aas_network: "Network",
    wait_class_aas_other: "Other",
    single_block_read_latency_ms: "Single-block Read latency (ms)",
    direct_path_read_latency_ms: "Direct Path Read latency (ms)",
    direct_path_write_latency_ms: "Direct Path Write latency (ms)",
    physical_read_mb_per_sec: "Physical Read (MB/s)",
    physical_write_mb_per_sec: "Physical Write (MB/s)",
    processes_usage_pct: "Processes Usage (%)",
    sessions_usage_pct: "Sessions Usage (%)",
    open_cursors_max_session_pct: "Open Cursors Usage (%)",
    system_ts_usage_pct: "SYSTEM",
    sysaux_ts_usage_pct: "SYSAUX",
    users_ts_usage_pct: "USERS",
    undo_ts_usage_pct: "UNDO",
    temp_ts_usage_pct: "TEMP",
    workarea_spill_rate_pct: "Spill Rate %",
    libcache_reload_per_s: "Library Cache Reloads/s",
    hard_parses_per_sec: "Hard Parses/s",
    spill_mb_per_min: "Spill MB/min",
    lgwr_active: "LGWR",
    dbwr_active: "DBWR",
    pmon_active: "PMON",
    smon_active: "SMON",
    ckpt_active: "CKPT",
    arcn_active: "ARC0",
    aas_total: "AAS Total",
    shared_pool_free_bytes: "Shared Pool Free (bytes)",
    fra_usage_pct: "FRA 사용률 (%)",
  };
  return nameMap[key] || key;
};

// 실제 데이터로 차트 렌더링
const renderChartWithData = (
  title: string,
  graphData: GraphDataResponse
) => {
  const { type, data } = graphData;

  if (!data || data.length === 0) {
    return <span>데이터가 없습니다.</span>;
  }

  // 데이터 변환
  const categories = data.map((point) => {
    const date = new Date(point.timestamp);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  });

  switch (type) {
    case 1: // Line
      const legends = Object.keys(data[0]?.values || {}).map(formatColumnName);
      const seriesData = Object.keys(data[0]?.values || {}).map((key) =>
        data.map((point) => Number(point.values[key] || 0))
      );
      return (
        <LineChart
          legends={legends}
          seriesData={seriesData}
          categories={categories}
        />
      );

    case 2: // Stack
      const stackLegends = Object.keys(data[0]?.values || {}).map(formatColumnName);
      const stackSeriesData = Object.keys(data[0]?.values || {}).map((key) =>
        data.map((point) => Number(point.values[key] || 0))
      );
      return (
        <StackChart
          legends={stackLegends}
          seriesData={stackSeriesData}
          categories={categories}
        />
      );

    case 3: // Gauge
      // 첫 번째 숫자 값을 찾아서 사용
      const gaugeValues = data[data.length - 1]?.values || {};
      const gaugeValueKey = Object.keys(gaugeValues).find((key) => 
        typeof gaugeValues[key] === 'number'
      );
      const gaugeValue = gaugeValueKey 
        ? Number(gaugeValues[gaugeValueKey] || 0)
        : 0;
      return <GaugeChart value={gaugeValue} />;

    case 4: // Donut
      // 첫 번째 숫자 값을 찾아서 사용
      const donutValues = data[data.length - 1]?.values || {};
      const donutValueKey = Object.keys(donutValues).find((key) => 
        typeof donutValues[key] === 'number'
      );
      const donutValue = donutValueKey 
        ? Number(donutValues[donutValueKey] || 0)
        : 0;
      return <GaugeChart value={donutValue} />;

    case 7: // Tile (MetricCard)
      const metrics = Object.entries(data[data.length - 1]?.values || {}).map(
        ([key, value]) => ({
          title: formatColumnName(key),
          value: String(value),
        })
      );
      return <MetricCard metrics={metrics} columns={2} />;

    default:
      // 기본적으로 LineChart로 표시
      const defaultLegends = Object.keys(data[0]?.values || {}).map(formatColumnName);
      const defaultSeriesData = Object.keys(data[0]?.values || {}).map((key) =>
        data.map((point) => Number(point.values[key] || 0))
      );
      return (
        <LineChart
          legends={defaultLegends}
          seriesData={defaultSeriesData}
          categories={categories}
        />
      );
  }
};
