import React, { useMemo, memo } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { formatNumberWithUnit, formatTooltipNumber } from "@/utils/numberFormatter";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface TimelineChartProps {
  legends?: string[];
  showLegend?: boolean;
  seriesData?: number[][];
  categories?: string[];
  yaxisTitle?: string;
  height?: number | string;
  yMin?: number;
  yMax?: number;
}

/**
 * Timeline Chart (Type 5)
 * 시간에 따른 여러 시리즈의 데이터를 보여주는 라인 차트
 * Top SQL by CPU 같은 경우에 사용
 */
const TimelineChart: React.FC<TimelineChartProps> = ({
  legends = ["Series 1"],
  showLegend = true,
  seriesData = [
    Array.from({ length: 5 }, () => Math.floor(Math.random() * 20) + 5),
  ],
  categories = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
  yaxisTitle = "",
  height = 190,
  yMin,
  yMax,
}) => {
  const colors = useMemo(
    () => [
      "#3B82F6",
      "#22C55E",
      "#A855F7",
      "#F97316",
      "#EAB308",
      "#06B6D4",
      "#EF4444",
      "#6366F1",
    ],
    []
  );

  const series = useMemo(
    () =>
      legends.map((name, i) => ({
        name,
        data: seriesData[i] || [],
      })),
    [legends, seriesData]
  );

  const options: ApexOptions = useMemo(
    () => ({
    chart: {
      type: "line",
      toolbar: { show: false },
      background: "transparent",
      animations: { enabled: true },
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
    xaxis: {
      categories,
      labels: {
        style: {
          colors: "#777",
          fontSize: "11px",
        },
      },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
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
        rotate: -90,
        offsetX: 0,
        offsetY: 0,
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
      min: yMin !== undefined ? yMin : 0,
      max: yMax !== undefined ? yMax : undefined,
    },
    dataLabels: { enabled: false },
    legend: {
      show: showLegend,
      position: "bottom",
      fontSize: "11px",
      itemMargin: { horizontal: 8 },
      onItemClick: {
        toggleDataSeries: true,
      },
      onItemHover: {
        highlightDataSeries: true,
      },
    },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
      },
      y: {
        formatter: (val) => formatTooltipNumber(Number(val)),
      },
    },
    }),
    [categories, yaxisTitle, yMin, yMax, showLegend, colors]
  );

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

// 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(TimelineChart);

