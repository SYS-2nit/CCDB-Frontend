import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const TimelineChart: React.FC = () => {
  const options: ApexOptions = {
    chart: { type: "rangeBar" },
    plotOptions: { bar: { horizontal: true } },
    xaxis: { type: "datetime" },
  };
  const series = [
    {
      data: [
        {
          x: "Task A",
          y: [
            new Date("2024-01-01").getTime(),
            new Date("2024-01-03").getTime(),
          ],
        },
        {
          x: "Task B",
          y: [
            new Date("2024-01-02").getTime(),
            new Date("2024-01-05").getTime(),
          ],
        },
      ],
    },
  ];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="rangeBar"
      height={135}
    />
  );
};

export default TimelineChart;
