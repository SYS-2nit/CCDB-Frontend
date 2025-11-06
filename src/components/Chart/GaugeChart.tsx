import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface GaugeChartProps {
  value?: number;
  label?: string;
  subLabel?: string;
  color?: string;
  size?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value = 72,
  label = "사용률",
  subLabel,
  color = "#60A5FA",
  size = 160,
}) => {
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
        },
        dataLabels: {
          name: {
            offsetY: 60,
            color: "#6B7280",
            fontSize: "12px",
            fontWeight: 500,
            show: !!label,
          },
          value: {
            offsetY: -10,
            fontSize: "20px",
            fontWeight: 700,
            color: "#111827",
            formatter: (val: number) => `${val.toFixed(2)}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        gradientToColors: [color],
        stops: [0, 100],
        opacityFrom: 0.95,
        opacityTo: 1,
      },
      colors: [color],
    },
    stroke: { lineCap: "round" },
    labels: [label],
  };

  const series = [value];

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        height={size}
      />
      {subLabel && (
        <p style={{ fontSize: 10, color: "#6B7280", marginTop: -8 }}>
          {subLabel}
        </p>
      )}
    </div>
  );
};

export default GaugeChart;
