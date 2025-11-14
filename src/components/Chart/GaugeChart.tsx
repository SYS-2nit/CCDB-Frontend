import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface GaugeChartProps {
  value?: number;
  label?: string;
  subLabel?: string;
  color?: string;
  size?: number;
  thickness?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value = 72,
  label = "사용률",
  subLabel,
  color = "#60A5FA",
  size = 180,
  thickness = 60,
}) => {
  // 두께 비율 계산: 값이 클수록 두꺼움
  const hollowSize = `${100 - thickness}%`;
  const strokeWidth = `${thickness}%`;

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
          size: hollowSize,
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
          strokeWidth: strokeWidth,
        },
        dataLabels: {
          name: {
            offsetY: 60,
            color: "#6B7280",
            fontSize: "0px",
            fontWeight: 500,
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
        width: "100%",
        maxWidth: `${size}px`,
        height: "100%",
        maxHeight: `${size}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        margin: "0 auto",
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
        height={size}
        width={size}
      />
      {subLabel && (
        <p style={{ fontSize: 10, color: "#6B7280", marginTop: -12 }}>
          {subLabel}
        </p>
      )}
    </div>
  );
};

export default GaugeChart;
