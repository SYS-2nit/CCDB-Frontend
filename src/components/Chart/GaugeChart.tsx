import type { ApexOptions } from "apexcharts";
import React, { useMemo, memo } from "react";
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
  size = 140,
  thickness = 60,
}) => {
  // 두께 비율 계산: 값이 클수록 두꺼움
  const hollowSize = useMemo(
    () => `${100 - thickness}%`,
    [thickness]
  );
  const strokeWidth = useMemo(() => `${thickness}%`, [thickness]);

  const options: ApexOptions = useMemo(
    () => ({
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
    }),
    [hollowSize, strokeWidth, color, label]
  );

  const series = useMemo(() => [value], [value]);

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

// 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(GaugeChart);
