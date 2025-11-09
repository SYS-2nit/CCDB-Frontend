import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

<<<<<<< HEAD
const GaugeChart: React.FC = () => {
  const value = 72;
=======
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
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b

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
<<<<<<< HEAD
          size: "60%",
=======
          size: hollowSize,
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
<<<<<<< HEAD
          strokeWidth: "100%",
          margin: 0,
=======
          strokeWidth: strokeWidth,
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
        },
        dataLabels: {
          name: {
            offsetY: 60,
            color: "#6B7280",
<<<<<<< HEAD
            fontSize: "14px",
=======
            fontSize: "0px",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
            fontWeight: 500,
          },
          value: {
            offsetY: -10,
<<<<<<< HEAD
            fontSize: "28px",
            fontWeight: 700,
            color: "#111827",
            formatter: (val: number) => `${val.toFixed(0)}%`,
=======
            fontSize: "20px",
            fontWeight: 700,
            color: "#111827",
            formatter: (val: number) => `${val.toFixed(2)}%`,
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
<<<<<<< HEAD
        gradientToColors: ["#6366F1"],
=======
        gradientToColors: [color],
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
        stops: [0, 100],
        opacityFrom: 0.95,
        opacityTo: 1,
      },
<<<<<<< HEAD
      colors: ["#60A5FA"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["사용률"],
=======
      colors: [color],
    },
    stroke: { lineCap: "round" },
    labels: [label],
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
  };

  const series = [value];

  return (
    <div
      style={{
<<<<<<< HEAD
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
=======
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="radialBar"
<<<<<<< HEAD
        height={200}
      />
=======
        height={size}
      />
      {subLabel && (
        <p style={{ fontSize: 10, color: "#6B7280", marginTop: -12 }}>
          {subLabel}
        </p>
      )}
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
    </div>
  );
};

export default GaugeChart;
