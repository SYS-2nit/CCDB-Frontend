import LineChart from "@/components/Chart/LineChart";
import StackChart from "@/components/Chart/StackChart";
import MetricCard from "@/components/Card/MetricCard";
import BarChart from "@/components/Chart/BarChart";

// Storage 탭 전용 차트 렌더러
export const storageChartRenderer = (title: string) => {
  // Storage Health Dashboard — MetricCard
  if (title.includes("Storage Health Dashboard")) {
    const metrics = [
      { title: "FRA Usage(%)", value: "78.5" },
      { title: "Undo Usage(%)", value: "52.3" },
      { title: "Temp Usage(%)", value: "14.0" },
      { title: "USERS(%)", value: "76.3" },
      { title: "Max TS Usage(%)", value: "68.4" },
      { title: "Total DB Usage(GB)", value: "52.3" },
    ];
    return <MetricCard metrics={metrics} columns={3} />;
  }

  // FRA 사용률 추세 — LineChart
  if (title.includes("FRA 사용률 추세"))
    return (
      <LineChart
        legends={[
          "Used Space (GB)",
          "Reclaimable Space (GB)",
          "Usage (%)",
          "Predicted 95% Threshold",
        ]}
        seriesData={[
          [150, 160, 170, 175, 180, 190, 195],
          [20, 18, 15, 14, 12, 10, 8],
          [75, 77, 79, 80, 82, 83, 85],
          [95, 95, 95, 95, 95, 95, 95],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Usage (%)"
      />
    );

  // Undo 사용률 추세 — LineChart
  if (title.includes("Undo 사용률 추세"))
    return (
      <LineChart
        legends={["Undo Usage (%)", "Long Transactions"]}
        seriesData={[
          [40, 42, 44, 50, 55, 48, 45],
          [2, 3, 4, 6, 5, 4, 3],
        ]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Undo Usage (%)"
      />
    );

  // Total Database Usage Trend — LineChart
  if (title.includes("Total Database Usage"))
    return (
      <LineChart
        legends={["Total DB Usage (%)"]}
        seriesData={[[60, 62, 65, 67, 70, 69, 68]]}
        categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
        yaxisTitle="Usage (%)"
      />
    );

  // 테이블스페이스 사용률 추세 — LineChart
  if (title.includes("테이블스페이스 사용률 추세"))
    return (
      <LineChart
        legends={["USERS", "UNDOTBS1", "TEMP", "SYSTEM", "SYSAUX"]}
        seriesData={[
          [75, 76, 78, 77, 79, 80, 81],
          [50, 51, 52, 52, 53, 54, 55],
          [40, 41, 43, 42, 44, 45, 45],
          [60, 61, 63, 62, 64, 65, 65],
          [55, 56, 57, 56, 58, 59, 60],
        ]}
        categories={["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"]}
        yaxisTitle="Usage (%)"
      />
    );

  // 테이블스페이스 증가 추세 — StackChart
  if (title.includes("테이블스페이스 증가 추세"))
    return (
      <BarChart
        legends={["Used Space (GB)", "Total Space (GB)", "Daily Growth (GB)"]}
        seriesData={[
          [400, 420, 450, 460, 480],
          [500, 520, 540, 560, 580],
          [10, 12, 15, 13, 14],
        ]}
        categories={["USERS", "UNDOTBS1", "TEMP", "SYSTEM", "SYSAUX"]}
        yaxisTitle="Space (GB)"
        horizontal={false}
      />
    );

  // Temp Tablespace Active Usage (GB) — LineChart + text
  if (title.includes("Temp Tablespace Active Usage")) {
    return (
      <div className="temp-chart-container">
        {/* 메인 라인 차트 */}
        <LineChart
          legends={["Active Usage (GB)"]}
          seriesData={[[2.8, 3.0, 3.2, 3.5, 3.3, 3.6, 3.4]]}
          categories={["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]}
          yaxisTitle="Usage (GB)"
        />
        {/* 추가 정보 */}
        <div className="temp-chart-container-content">
          <div className="temp-chart-container-content-text">
            Current Active Usage(GB) - 3.5
          </div>
          <div className="temp-chart-container-content-text">
            Current Allocated Size(GB) - 5.2
          </div>
          <div className="temp-chart-container-content-text">
            Current Allocated Size(GB) - 7.6
          </div>
          <div className="temp-chart-container-content-text">
            Peak Usage(GB) - 4.8
          </div>
        </div>
      </div>
    );
  }

  // 대용량 세그먼트 Top 5 — StackChart
  if (title.includes("대용량 세그먼트"))
    return (
      <StackChart
        legends={["Size (GB)"]}
        seriesData={[[120, 95, 85, 70, 65]]}
        categories={[
          "AP_DATA_01",
          "SALES_IDX_01",
          "TEMP_LOG",
          "UNDO_TBL",
          "SYSTEM_TS",
        ]}
        yaxisTitle="Size (GB)"
      />
    );

  // 기본값
  return <LineChart />;
};
