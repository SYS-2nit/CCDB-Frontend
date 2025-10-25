import React from "react";
import ReactApexChart from "react-apexcharts";
import { baseChartOptions } from "./baseChartOptions";
import type { ApexOptions } from "apexcharts";

const StackChart: React.FC = () => {
  const options: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: "bar", stacked: true },
  };
  const series = [
    { name: "Text A", data: [10, 20, 15, 25, 30, 22] },
    { name: "Text B", data: [5, 10, 8, 12, 18, 15] },
  ];

  return (
    <ReactApexChart options={options} series={series} type="bar" height={135} />
  );
};

export default StackChart;
