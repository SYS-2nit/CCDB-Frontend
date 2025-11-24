import React, { useMemo, memo } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface DonutChartProps {
  labels?: string[];
  series?: number[];
  colors?: string[];
  size?: number;
  height?: number | string;
}

/**
 * Donut Chart (Type 4)
 * 도넛 형태의 차트 (Gauge와 유사하지만 여러 데이터를 표시)
 */
const DonutChart: React.FC<DonutChartProps> = ({
  labels = ["Series 1", "Series 2", "Series 3"],
  series = [44, 55, 13],
  colors = ["#3B82F6", "#22C55E", "#A855F7", "#F97316", "#EAB308"],
  height = 150,
}) => {
  const options: ApexOptions = useMemo(
    () => ({
    chart: {
      type: "donut",
      toolbar: { show: false },
      background: "transparent",
    },
    labels,
    colors,
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              fontWeight: 500,
              color: "#6B7280",
            },
            value: {
              show: true,
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827",
              formatter: (val: string) => `${val}%`,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => {
                const total = series.reduce((a, b) => a + b, 0);
                return total.toLocaleString();
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontWeight: 500,
        colors: ["#fff"],
      },
      dropShadow: {
        enabled: false,
      },
    },
    legend: {
      show: true,
      position: "bottom",
      fontSize: "11px",
      itemMargin: { horizontal: 8 },
    },
    tooltip: {
      theme: "light",
      y: {
        formatter: (val: number) => {
          const total = series.reduce((a, b) => a + b, 0);
          return `${val.toLocaleString()} (${((val / total) * 100).toFixed(1)}%)`;
        },
      },
    },
    }),
    [labels, colors, series]
  );

  return (
    <div style={{ width: "100%", height: "100%", maxWidth: "100%", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={height}
        width="100%"
      />
    </div>
  );
};

// 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(DonutChart);

