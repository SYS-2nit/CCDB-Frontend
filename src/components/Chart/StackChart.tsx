import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface StackChartProps {
  stackCount?: number;
  legends?: string[];
  seriesData?: number[][];
  categories?: string[];
  yaxisTitle?: string;
}

const StackChart: React.FC<StackChartProps> = ({ stackCount = 5 }) => {
  const labels = ["SYSTEM", "SYSAUX", "USERS", "UNDO", "TEMP"].slice(
    0,
    stackCount
  );
  const usage = [90, 80, 70, 50, 30].slice(0, stackCount);
  const total = [5120, 3072, 10240, 2048, 4096].slice(0, stackCount);
  const used = usage.map((v, i) => ((v / 100) * total[i]).toFixed(0));

  const getColor = (percent: number) => {
    if (percent >= 90) return "#3B82F6";
    if (percent >= 80) return "#22C55E";
    if (percent >= 50) return "#6366F1";
    return "#A855F7";
  };

  const series = [
    {
      name: "Usage",
      data: usage.map((percent) => ({
        x: "",
        y: percent,
        fillColor: getColor(percent),
      })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
        barHeight: "90%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${(val as number).toFixed(0)}%`,
      style: {
        fontSize: "12px",
        fontWeight: 700,
        colors: ["#fff"],
      },
    },
    xaxis: {
      categories: labels,
      max: 100,
      labels: {
        style: { colors: "#888", fontSize: "10px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#555", fontSize: "10px", fontWeight: 500 },
      },
    },
    grid: {
      borderColor: "rgba(0,0,0,0.05)",
      strokeDashArray: 3,
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (_val, { dataPointIndex }) => {
          const idx = dataPointIndex;
          const usedMB = Number(used[idx]).toLocaleString();
          const totalMB = total[idx].toLocaleString();
          const freeMB = (total[idx] - Number(used[idx])).toLocaleString();
          return `Used: ${usedMB}MB / Free: ${freeMB}MB / Total: ${totalMB}MB`;
        },
      },
    },
    legend: { show: false },
  };

  return (
    <div id="stack-chart" style={{ width: "100%", height: "100%" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={150}
      />
    </div>
  );
};

export default StackChart;
