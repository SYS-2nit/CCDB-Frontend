import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const GaugeChart: React.FC = () => {
  const options: ApexOptions = {
    chart: { type: "radialBar" },
    plotOptions: {
      radialBar: {
        hollow: { size: "70%" },
        dataLabels: { value: { fontSize: "24px" } },
      },
    },
    colors: ["#10B981"],
    labels: ["N / N%"],
  };
  const series = [68]; // % 값

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radialBar"
      height={135}
    />
  );
};

export default GaugeChart;
