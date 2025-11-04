import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const GaugeChart: React.FC = () => {
  const value = 72;

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
      background: "transparent",
    },
    plotOptions: {
      radialBar: {
        startAngle: -140,
        endAngle: 140,
        hollow: {
          size: "60%",
          background: "#ffffff",
          dropShadow: {
            enabled: true,
            top: 2,
            blur: 3,
            color: "rgba(0, 0, 0, 0.08)",
          },
        },
        track: {
          background: "#E5E7EB",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: {
            offsetY: 60,
            color: "#6B7280",
            fontSize: "14px",
            fontWeight: 500,
          },
          value: {
            offsetY: -10,
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
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
        gradientToColors: ["#6366F1"],
        stops: [0, 100],
        opacityFrom: 0.95,
        opacityTo: 1,
      },
      colors: ["#60A5FA"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["사용률"],
  };

  const series = [value];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        height={200}
      />
    </div>
  );
};

export default GaugeChart;
