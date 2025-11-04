import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface LineChartProps {
  legends?: string[];
  showLegend?: boolean;
  seriesData?: number[][];
  categories?: string[];
  yaxisTitle?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  legends = ["Series 1"],
  showLegend = false,
  seriesData = [
    Array.from({ length: 5 }, () => Math.floor(Math.random() * 20) + 5),
  ],
  categories = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
  yaxisTitle = "",
}) => {
  const colors = [
    "#3B82F6",
    "#22C55E",
    "#A855F7",
    "#F97316",
    "#EAB308",
    "#06B6D4",
    "#EF4444",
    "#6366F1",
  ];

  const series = legends.map((name, i) => ({
    name,
    data: seriesData[i] || [],
  }));

  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      background: "transparent",
      animations: { enabled: true },
    },
    stroke: {
      curve: "smooth",
      width: 2.0,
    },
    colors,
    grid: {
      borderColor: "rgba(0,0,0,0.08)",
      strokeDashArray: 3,
      padding: { top: 10, right: 10, bottom: 0, left: 15 }, // ✅ y축 공간 확보
    },
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#777",
          fontSize: "11px",
        },
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      show: true,
      showAlways: true,
      title: {
        text: yaxisTitle,
        style: {
          fontSize: "12px",
          color: "#555",
          fontWeight: 500,
        },
        rotate: -90,
        offsetX: 0,
        offsetY: 0,
      },
      labels: {
        show: true,
        style: {
          fontSize: "11px",
          colors: "#777",
        },
      },
      axisBorder: {
        show: true,
        color: "rgba(0,0,0,0.1)",
      },
      axisTicks: {
        show: false,
      },
    },
    dataLabels: { enabled: false },
    legend: {
      show: showLegend,
      position: "bottom",
      fontSize: "11px",
      itemMargin: { horizontal: 8 },
      onItemClick: {
        toggleDataSeries: true,
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={190}
      />
    </div>
  );
};

export default LineChart;
