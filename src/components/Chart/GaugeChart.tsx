import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const GaugeChart: React.FC = () => {
  const options: ApexOptions = {
    chart: { type: "radialBar", sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 225,
        hollow: {
          size: "40%",
          background: "transparent",
        },
        track: {
          background: "#f0f2f5",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            offsetY: 30,
            color: "#6A6A6A",
            fontSize: "12px",
            fontWeight: "500",
          },
          value: {
            offsetY: -10,
            fontSize: "24px",
            fontWeight: "700",
            color: "#151515",
            formatter: (val: number) => `${val.toFixed(0)}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        gradientToColors: ["#A8C1FF"],
        inverseColors: false,
      },
    },
    stroke: { lineCap: "round" },
    labels: ["사용률"],
  };

  const series = [65];

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radialBar"
      height={150}
    />
  );
};

export default GaugeChart;
