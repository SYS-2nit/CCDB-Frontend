import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { baseChartOptions } from "./baseChartOptions";

interface BarChartProps {
  barCount?: number; // 막대 개수 (기본 3)
  categories?: string[]; // X축 항목
  data?: number[]; // 값 배열
  xaxisTitle?: string; // X축 제목
  yaxisTitle?: string; // Y축 제목
  colors?: string[]; // 막대 색상
}

const BarChart: React.FC<BarChartProps> = ({
  barCount = 3,
  categories = ["Idle ≥10m", "Idle ≥30m", "Idle ≥60m"],
  data = [72, 41, 9],
  xaxisTitle,
  yaxisTitle = "Sessions (count)",
  colors = ["#E59819"],
}) => {
  // 데이터 개수 조정
  const slicedCategories = categories.slice(0, barCount);
  const slicedData = data.slice(0, barCount);

  const series = [
    {
      name: "Count",
      data: slicedData,
    },
  ];

  const options: ApexOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: "bar",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    colors,
    plotOptions: {
      bar: {
        borderRadius: 3,
        columnWidth: "40%",
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toString(),
      style: {
        fontSize: "12px",
        colors: ["#333"],
      },
    },
    xaxis: {
      categories: slicedCategories,
      title: xaxisTitle
        ? {
            text: xaxisTitle,
            style: { fontSize: "11px", color: "#555" },
          }
        : undefined,
      labels: {
        style: { fontSize: "10px", colors: "#666" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        text: yaxisTitle,
        style: { fontSize: "11px", color: "#555" },
      },
      labels: {
        style: { fontSize: "10px", colors: "#777" },
      },
    },
    grid: {
      borderColor: "#eee",
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} sessions`,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "150px" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={150}
      />
    </div>
  );
};

export default BarChart;
