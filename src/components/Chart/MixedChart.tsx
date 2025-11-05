import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface MixedChartProps {
  categories?: string[];
  columnData?: number[];
  lineData?: number[];
  yaxisLeftTitle?: string;
  yaxisRightTitle?: string;
}

const MixedChart: React.FC<MixedChartProps> = ({
  categories = ["Jan 01", "Jan 03", "Jan 05", "Jan 07", "Jan 09", "Jan 11"],
  columnData = [400, 430, 390, 200, 480, 290],
  lineData = [23, 42, 35, 43, 22, 31],
  yaxisLeftTitle = "",
  yaxisRightTitle = "",
}) => {
  const series = [
    {
      name: yaxisLeftTitle,
      type: "column",
      data: columnData,
    },
    {
      name: yaxisRightTitle,
      type: "line",
      data: lineData,
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "line",
      stacked: false,
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: {
      width: [0, 3],
      curve: "smooth",
    },
    colors: ["#3B82F6", "#22C55E"],
    dataLabels: {
      enabled: true,
      enabledOnSeries: [1],
      style: {
        fontSize: "11px",
        fontWeight: 600,
        colors: ["#22C55E"],
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 3,
      },
    },
    xaxis: {
      categories,
      labels: {
        style: { fontSize: "11px", colors: "#777" },
      },
    },
    yaxis: [
      {
        title: { text: undefined },
        labels: {
          style: { colors: "#3B82F6", fontSize: "11px" },
        },
      },
      {
        opposite: true,
        title: { text: undefined },
        labels: {
          style: { colors: "#22C55E", fontSize: "11px" },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      theme: "light",
      y: {
        formatter: (val, { seriesIndex, w }) => {
          const name = w.config.series?.[seriesIndex]?.name || "";
          return `${name}: ${val?.toLocaleString?.() ?? ""}`;
        },
        title: {
          formatter: () => "",
        },
      },
    },

    legend: {
      show: false,
    },
    grid: {
      borderColor: "rgba(0,0,0,0.08)",
      strokeDashArray: 3,
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactApexChart
        options={options}
        series={series}
        height={320}
        type="line"
      />
    </div>
  );
};

export default MixedChart;
