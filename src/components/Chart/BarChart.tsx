import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import dayjs from "dayjs";

export interface BarChartProps {
  barCount?: number;
  legends?: string[];
  seriesData?: number[][];
  categories?: string[];
  yaxisTitle?: string;
  xaxisTitle?: string;
  data?: number[];
  colors?: string[];
  horizontal?: boolean;
  height?: number | string;
}

const BarChart: React.FC<BarChartProps> = ({
  barCount,
  legends,
  seriesData,
  categories,
  yaxisTitle,
  xaxisTitle,
  data,
  colors = ["#6366F1", "#22C55E", "#F59E0B", "#E11D48", "#F97316"],
  horizontal = false,
  height = 150,
}) => {
  const selectedColors = barCount ? colors.slice(0, barCount) : colors;

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
    },
    colors: selectedColors,
    plotOptions: {
      bar: {
        horizontal,
        columnWidth: "90%",
        borderRadius: 2,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },

    xaxis: {
      categories,
      title: { text: xaxisTitle, style: { fontSize: "11px", color: "#666" } },
      labels: {
        style: { fontSize: "11px", colors: "#666" },
        formatter: (value: string) => {
          if (!value) return value;
          const d = dayjs(value);
          return d.isValid() ? d.format("MM-DD HH:mm") : value;
        },
      },
    },
    yaxis: {
      title: { text: yaxisTitle, style: { fontSize: "11px", color: "#666" } },
      labels: { style: { fontSize: "11px", colors: "#777" } },
    },
    fill: { opacity: 1 },
    legend: {
      position: "bottom",
      fontSize: "11px",
      horizontalAlign: "center",
    },
    grid: {
      borderColor: "rgba(0,0,0,0.1)",
      strokeDashArray: 3,
      padding: { top: 5, bottom: 0, right: 10, left: 5 },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val: number) => `${val.toLocaleString()}`,
      },
    },
  };

  const series =
    data && data.length > 0
      ? [{ name: "Value", data }]
      : legends?.map((name, idx) => ({
          name,
          data: seriesData ? seriesData[idx] : [],
        })) ?? [];

  return (
    <div
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    </div>
  );
};

export default BarChart;
