import type { ApexOptions } from "apexcharts";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

// 모든 차트에서 공유할 공통 스타일 설정
export const baseChartOptions: ApexOptions = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    background: "transparent",
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  grid: {
    borderColor: "#E5E7EB",
    strokeDashArray: 4,
  },
  xaxis: {
    categories: ["Text", "Text", "Text", "Text", "Text", "Text", "Text"],
    labels: { style: { colors: "#6B7280", fontSize: "12px" } },
  },
  yaxis: {
    labels: { style: { colors: "#6B7280", fontSize: "12px" } },
  },
  legend: {
    position: "bottom",
    labels: { colors: "#6B7280" },
  },
  colors: ["#4F46E5", "#22C55E", "#A78BFA"],
};
