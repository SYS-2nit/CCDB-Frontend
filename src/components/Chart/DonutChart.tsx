import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const DonutChart: React.FC = () => {
  const options: ApexOptions = {
    chart: { type: "donut" },
    labels: ["Text A", "Text B", "Text C"],
    legend: { position: "bottom" },
    colors: ["#6366F1", "#22C55E", "#A78BFA"],
  };
  const series = [44, 33, 23];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="donut"
      height={135}
    />
  );
};

export default DonutChart;
