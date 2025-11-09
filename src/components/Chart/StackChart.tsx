import { getCssVar } from "@/styles/utils/getCssVar";
import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface ColorRule {
  min: number;
  max: number;
  color: string;
}

<<<<<<< HEAD
interface StackChartProps {
  stackCount?: number;
  legends?: string[];
  seriesData?: number[][];
  categories?: string[];
  yaxisTitle?: string;
  colorRules?: ColorRule[];
}

const StackChart: React.FC<StackChartProps> = ({
  stackCount = 5,
  colorRules = [
    { min: 0, max: 70, color: getCssVar("sematic-success") }, // 정상
    { min: 71, max: 85, color: getCssVar("sematic-warning") }, // 주의
    { min: 86, max: 100, color: getCssVar("sematic-error") }, // 위험
  ],
}) => {
  const labels = ["SYSTEM", "SYSAUX", "USERS", "UNDO", "TEMP"].slice(
    0,
    stackCount
  );
  const usage = [90, 80, 70, 50, 30].slice(0, stackCount);
  const total = [5120, 3072, 10240, 2048, 4096].slice(0, stackCount);
  const used = usage.map((v, i) => ((v / 100) * total[i]).toFixed(0));

  // 색상 결정 함수 — colorRules 기반
  const getColor = (percent: number) => {
    const rule = colorRules.find((r) => percent >= r.min && percent < r.max);
    return rule ? rule.color : getCssVar("$gray-300");
=======
interface TooltipFormatData {
  used: number;
  total: number;
  percent: number;
}

interface StackChartProps {
  stackCount?: number;
  labels?: string[];
  usage?: number[];
  total?: number[];
  tooltipFormatter?: (data: TooltipFormatData, index: number) => string;
  yaxisTitle?: string;
  colorRules?: ColorRule[];
  height?: number | string;
}

const StackChart: React.FC<StackChartProps> = ({
  stackCount,
  labels = [],
  usage = [],
  total = [],
  tooltipFormatter,
  colorRules = [
    { min: 0, max: 70, color: getCssVar("sematic-success") },
    { min: 71, max: 85, color: getCssVar("sematic-warning") },
    { min: 86, max: 100, color: getCssVar("sematic-error") },
  ],
  height = 150,
  yaxisTitle,
}) => {
  const _labels = labels.slice(0, stackCount);
  const _usage = usage.slice(0, stackCount);
  const _total = total.slice(0, stackCount);

  // 사용률 계산
  const percents = _usage.map((v, i) => (v / _total[i]) * 100);

  const getColor = (percent: number) => {
    const rule = colorRules.find((r) => percent >= r.min && percent < r.max);
    return rule ? rule.color : getCssVar("gray-300");
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
  };

  const series = [
    {
      name: "Usage",
      data: percents.map((p, i) => ({
        x: _labels[i],
        y: p,
        fillColor: getColor(p),
      })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        horizontal: true,
<<<<<<< HEAD
        barHeight: "90%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${(val as number).toFixed(0)}%`,
      style: {
        fontSize: "12px",
        fontWeight: 700,
        colors: ["#fff"],
=======
        barHeight: "80%",
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: _labels,
      max: 100,
      title: yaxisTitle
        ? {
            text: yaxisTitle,
            style: {
              color: "#555",
              fontSize: "11px",
              fontWeight: 600,
            },
          }
        : {
            text: undefined,
            offsetX: 0,
            offsetY: 0,
            style: { fontSize: "0px" },
          },
      labels: {
        style: { colors: "#888", fontSize: "10px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#555", fontSize: "10px", fontWeight: 500 },
      },
    },
    grid: {
      borderColor: "rgba(0,0,0,0.05)",
      strokeDashArray: 3,
    },
    tooltip: {
      theme: "light",
      y: {
<<<<<<< HEAD
        formatter: (_val, { dataPointIndex }) => {
          const idx = dataPointIndex;
          const usedMB = Number(used[idx]).toLocaleString();
          const totalMB = total[idx].toLocaleString();
          const freeMB = (total[idx] - Number(used[idx])).toLocaleString();
          return `Used: ${usedMB}MB / Free: ${freeMB}MB / Total: ${totalMB}MB`;
=======
        formatter: (_, { dataPointIndex }) => {
          const idx = dataPointIndex;
          const used = _usage[idx];
          const totalVal = _total[idx];
          const percent = (used / totalVal) * 100;

          if (tooltipFormatter) {
            return tooltipFormatter({ used, total: totalVal, percent }, idx);
          }
          return `${used} / ${totalVal} (${percent.toFixed(1)}%)`;
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
        },
      },
    },
    legend: { show: false },
  };

  return (
<<<<<<< HEAD
    <div id="stack-chart" style={{ width: "120%", height: "170px" }}>
=======
    <div
      id="stack-chart"
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
<<<<<<< HEAD
        height={170}
=======
        height={height}
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
      />
    </div>
  );
};

export default StackChart;
