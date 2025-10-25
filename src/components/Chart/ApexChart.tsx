import React from "react";
import ReactApexChart from "react-apexcharts";

interface ApexChartProps {
  type?: "line" | "area" | "bar" | "radialBar" | "donut";
  height?: number;
}

const ApexChart: React.FC<ApexChartProps> = ({
  type = "area",
  height = 200,
}) => {
  const options: ApexCharts.ApexOptions = {
    chart: {
      type,
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

  const series = [
    {
      name: "Text (단위)",
      data: [10, 15, 12, 18, 14, 22, 19],
    },
    {
      name: "Text (단위)",
      data: [8, 12, 11, 17, 13, 19, 16],
    },
  ];

  return (
    <div className="apex-chart">
      <ReactApexChart
        options={options}
        series={series}
        type={type}
        height={height}
      />
    </div>
  );
};

export default ApexChart;
