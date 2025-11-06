import { getCssVar } from "@/styles/utils/getCssVar";
import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface ColorRule {
  min: number;
  max: number;
  color: string;
}

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
  height?: number;
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
  height = 170,
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
  };

  // y값은 비율(percent)로 설정
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
        barHeight: "80%",
      },
    },
    dataLabels: {
      enabled: false, // 수치 안 보여주기
    },
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
            style: { fontSize: "0px" }, // 완전히 숨김
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
        formatter: (_, { dataPointIndex }) => {
          const idx = dataPointIndex;
          const used = _usage[idx];
          const totalVal = _total[idx];
          const percent = (used / totalVal) * 100;

          if (tooltipFormatter) {
            return tooltipFormatter({ used, total: totalVal, percent }, idx);
          }
          return `${used} / ${totalVal} (${percent.toFixed(1)}%)`;
        },
      },
    },
    legend: { show: false },
  };

  return (
    <div id="stack-chart" style={{ width: "100%", height: `${height}px` }}>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    </div>
  );
};

export default StackChart;
