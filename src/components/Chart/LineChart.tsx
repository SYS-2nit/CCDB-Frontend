import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { baseChartOptions } from "./baseChartOptions";

interface LineChartProps {
  legends?: string[]; // 범례 이름 배열
  seriesData?: number[][]; // 각 라인 데이터 배열
  categories?: string[]; // X축 라벨
  yaxisTitle?: string; // Y축 제목
}

const LineChart: React.FC<LineChartProps> = ({
  legends = ["Series 1"],
  seriesData = [
    Array.from({ length: 7 }, () => Math.floor(Math.random() * 20) + 5),
  ],
  categories = ["00:10", "00:20", "00:30", "00:40", "00:50", "01:00", "01:10"],
  yaxisTitle,
}) => {
  const series = legends.map((name, i) => ({
    name,
    data: seriesData[i] || [],
  }));

  const options: ApexOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: "line",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    stroke: {
      width: 1,
      curve: "smooth",
    },
    grid: {
      ...baseChartOptions.grid,
      padding: { top: 5, right: 10, bottom: 0, left: 5 },
    },
    xaxis: {
      ...baseChartOptions.xaxis,
      categories,
      labels: {
        style: {
          fontSize: "10px",
          colors: "#666",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      title: yaxisTitle
        ? {
            text: yaxisTitle,
            style: {
              fontSize: "10px",
              fontWeight: 600,
              color: "#555",
            },
          }
        : undefined,
      labels: {
        style: {
          fontSize: "10px",
          colors: "#777",
        },
        offsetX: -5,
        formatter: (val: number) => `${val}`,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      min: 0,
    },
    legend: {
      show: legends.length > 1,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "10px",
      itemMargin: { horizontal: 10 },
    },
  };

  return (
    <div style={{ width: "100%", height: "150px" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={150}
      />
    </div>
  );
};

export default LineChart;
