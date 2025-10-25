import React from "react";
import ReactApexChart from "react-apexcharts";
import { baseChartOptions } from "./baseChartOptions";
import type { ApexOptions } from "apexcharts";

interface LineChartProps {
  seriesCount?: number;
  title?: string;
}

const LineChart: React.FC<LineChartProps> = ({ seriesCount = 1, title }) => {
  const series = Array.from({ length: seriesCount }, (_, i) => ({
    name: `Line ${i + 1}`,
    data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5),
  }));

  const options: ApexOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: "line" as const,
      toolbar: { show: false },
      animations: { enabled: false },
    },
    stroke: {
      width: 1,
      curve: "smooth",
    },
    grid: {
      ...baseChartOptions.grid,
      padding: {
        top: 5,
        right: 10,
        bottom: 0,
        left: 5,
      },
    },
    xaxis: {
      ...baseChartOptions.xaxis,
      categories: ["MM:SS", "MM:SS", "MM:SS", "MM:SS", "MM:SS", "MM:SS"],
      labels: {
        style: {
          fontSize: "10px",
          colors: "#666",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      labels: {
        style: {
          fontSize: "10px",
          colors: "#777",
        },
        offsetX: -5,
        formatter: (val: number) => `${val}`,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      min: 0,
      max: 30,
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "10px",
      itemMargin: { horizontal: 10 },
    },
    title: {
      text: title,
      style: { fontSize: "10px", color: "#111" },
    },
  };

  return (
    <div style={{ width: "100%", height: "135px" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={135}
      />
    </div>
  );
};

export default LineChart;
