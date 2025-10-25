import React from "react";
import ReactApexChart from "react-apexcharts";
import { baseChartOptions } from "./baseChartOptions";
import type { ApexOptions } from "apexcharts";

const LineChart: React.FC = () => {
  const options: ApexOptions = {
    ...baseChartOptions,
    chart: { ...baseChartOptions.chart, type: "line" },
  };
  const series = [
    { name: "Text (단위)", data: [10, 15, 12, 18, 14, 22, 19] },
    { name: "Text (단위)", data: [8, 12, 11, 17, 13, 19, 16] },
  ];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="line"
      height={135}
    />
  );
};

export default LineChart;
