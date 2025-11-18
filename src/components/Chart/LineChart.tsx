import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { formatNumberWithUnit, formatTooltipNumber } from "@/utils/numberFormatter";

interface LineChartProps {
  legends?: string[];
  showLegend?: boolean;
  seriesData?: number[][];
  categories?: string[];
  date?: string;
  yaxisTitle?: string;
  height?: number | string;
  yMin?: number;
  yMax?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  legends = ["Series 1"],
  showLegend = false,
  seriesData = [],
  categories = [],
  date,
  yaxisTitle = "",
  height = 190,
  yMin,
  yMax,
}) => {
  const colors = [
    "#3B82F6",
    "#22C55E",
    "#A855F7",
    "#F97316",
    "#EAB308",
    "#06B6D4",
    "#EF4444",
    "#6366F1",
  ];

  // 데이터 검증: NaN, Infinity, -Infinity를 필터링
  const sanitizeData = (data: number[]): number[] => {
    return data.map((v) => (Number.isFinite(v) ? v : 0));
  };

  const series = legends.map((name, i) => ({
    name,
    data: sanitizeData(seriesData[i] || []),
  }));

  /** Apex 옵션 */
  const options: ApexOptions = {
    chart: {
      type: "line",
      toolbar: { show: false },
      background: "transparent",
      animations: { enabled: true },
      zoom: {
        enabled: true,
        type: "x",
        autoSelected: "selection",
      },
      selection: {
        enabled: true,
        xaxis: {
          min: undefined,
          max: undefined,
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.0,
    },
    colors,
    grid: {
      borderColor: "rgba(0,0,0,0.08)",
      strokeDashArray: 3,
      padding: { top: 10, right: 5, bottom: 0, left: 10 },
    },

    /** X축 포맷 */
    xaxis: {
      categories,
      labels: {
        formatter: (value: string) => {
          return formatDate(date, value);
        },
        rotate: -45,
        style: {
          colors: "#777",
          fontSize: "10px",
        },
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },

    /** Y축 */
    yaxis: {
      show: true,
      showAlways: true,
      title: {
        text: yaxisTitle,
        style: {
          fontSize: "12px",
          color: "#555",
          fontWeight: 500,
        },
      },
      labels: {
        show: true,
        formatter: (val) => formatNumberWithUnit(Number(val)),
        style: {
          fontSize: "11px",
          colors: "#777",
        },
      },
      axisBorder: {
        show: true,
        color: "rgba(0,0,0,0.1)",
      },
      axisTicks: {
        show: false,
      },
      min: yMin !== undefined && Number.isFinite(yMin) ? yMin : 0,
      max: yMax !== undefined && Number.isFinite(yMax) ? yMax : undefined,
    },

    dataLabels: { enabled: false },

    legend: {
      show: showLegend,
      position: "bottom",
      fontSize: "11px",
      itemMargin: { horizontal: 8 },
    },

    tooltip: {
      theme: "light",
      y: {
        formatter: (val) => formatTooltipNumber(Number(val)),
      },
      y: {
        formatter: (val) => formatTooltipNumber(Number(val)),
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%", maxWidth: "100%", overflow: "hidden" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={height}
        width="100%"
      />
    </div>
  );
};

export default LineChart;
