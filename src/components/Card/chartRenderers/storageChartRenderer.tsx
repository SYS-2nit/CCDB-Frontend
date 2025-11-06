import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
import MetricCard from "@/components/Card/MetricCard";
import BarChart from "@/components/Chart/BarChart";
import { getCssVar } from "@/styles/utils/getCssVar";

// Storage 탭 전용 차트 렌더러
export const storageChartRenderer = (title: string) => {
  if (title.includes("Storage Health Dashboard")) {
    const metrics = [
      { title: "FRA Usage(%)", value: "78.5" },
      { title: "Undo Usage(%)", value: "52.3" },
      { title: "Temp Usage(%)", value: "14.0" },
      { title: "USERS(%)", value: "76.3" },
      { title: "Max TS Usage(%)", value: "68.4" },
      { title: "Total DB Usage(GB)", value: "52.3" },
    ];
    return <MetricCard metrics={metrics} columns={6} />;
  }

  if (title.includes("FRA 사용률 추세 (%)"))
    return (
      <LineChart
        legends={["usage_pct"]}
        seriesData={[[150, 160, 170, 175, 180, 190, 195]]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
      />
    );

  if (title.includes("Undo 사용률 추세 (%)"))
    return (
      <LineChart
        legends={["undo_usage_percent"]}
        seriesData={[[40, 42, 44, 50, 55, 48, 45]]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
      />
    );

  if (title.includes("Total Database Usage Trend (%)"))
    return (
      <LineChart
        legends={["total_db_usage_pct"]}
        seriesData={[[60, 62, 65, 67, 70, 69, 68]]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
      />
    );

  if (title.includes("테이블스페이스 사용률 추세 (%)"))
    return (
      <LineChart
        legends={[
          "system_used_percent",
          "sysaux_used_percent",
          "undotbs1_used_space_gb_inc ",
          "users_used_space_gb_inc",
        ]}
        seriesData={[
          [75, 76, 78, 77, 79, 80, 81],
          [50, 51, 52, 52, 53, 54, 55],
          [40, 41, 43, 42, 44, 45, 45],
          [60, 61, 63, 62, 64, 65, 65],
        ]}
        categories={["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]}
      />
    );

  if (title.includes("테이블스페이스 증가 추세 (GB)"))
    return (
      <BarChart
        legends={[
          "system_used_space_gb_inc",
          "sysaux_used_space_gb_inc",
          "undotbs1_used_space_gb_inc",
          "users_used_space_gb_inc",
        ]}
        seriesData={[
          [400, 420, 450, 460, 480, 106],
          [500, 520, 540, 560, 580, 325],
          [500, 520, 340, 560, 730, 602],
          [308, 270, 148, 810, 280, 403],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        horizontal={false}
      />
    );

  if (title.includes("Temp Tablespace Active Usage (GB)")) {
    return (
      <div className="temp-chart-container">
        <div className="temp-chart-container-row">
          <div className="temp-chart-container-row-content">
            temp_current_size_gb : ???
          </div>
          <div className="temp-chart-container-row-content">
            temp_max_size_gb : ???
          </div>
        </div>
        <div className="temp-chart-container-row">
          <div className="temp-chart-container-row-content">
            temp_usage_pct(%) : ???
          </div>
          <div className="temp-chart-container-row-content">
            temp_usage_pct_of_max(%) : ???
          </div>
        </div>
        <LineChart
          legends={["temp_active_usage_gb"]}
          seriesData={[[2.8, 3.0, 3.2, 3.5, 3.3, 3.6, 3.4]]}
          categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        />
      </div>
    );
  }

  if (title.includes("대용량 세그먼트 Top 5"))
    return (
      <StackChart
        labels={["1_owner_seg", "2_owner_seg", "3_owner_seg", "4_owner_seg"]}
        usage={[367, 9739, 12022, 4289]}
        total={[16500, 13800, 12100, 9800]}
        colorRules={[{ min: 0, max: 100, color: getCssVar("main-500") }]}
        tooltipFormatter={({ used, total, percent }) =>
          `사용: ${used.toLocaleString()}MB / 전체: ${total.toLocaleString()}MB (${percent.toFixed(
            1
          )}%)`
        }
      />
    );

  // 기본값
  return <LineChart />;
};
