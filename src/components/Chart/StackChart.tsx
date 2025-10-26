import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface StackChartProps {
  stackCount?: number; // 막대 개수 (기본 5)
}

const StackChart: React.FC<StackChartProps> = ({ stackCount = 5 }) => {
  // 예시 데이터
  const labels = ["SYSTEM", "SYSAUX", "USERS", "UNDO", "TEMP"].slice(
    0,
    stackCount
  );

  const usage = [90, 80, 70, 50, 30].slice(0, stackCount); // 사용률(%)
  const total = [5120, 3072, 10240, 2048, 4096].slice(0, stackCount);
  const used = usage.map((v, i) => ((v / 100) * total[i]).toFixed(0));

  // 상태별 색상 설정
  const getColor = (percent: number) => {
    if (percent >= 85) return "#E74C3C"; // 위험
    if (percent >= 70) return "#F1C40F"; // 주의
    return "#2ECC71"; // 정상
  };

  const series = [
    {
      name: "Usage",
      data: usage.map((percent) => ({
        x: "",
        y: percent,
        fillColor: getColor(percent),
      })),
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "100%",
        distributed: true,
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
      style: {
        fontSize: "13px",
        fontWeight: 600,
        colors: ["#fff"],
      },
    },
    xaxis: {
      categories: labels,
      max: 100,
      labels: {
        style: { colors: "#999", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "#333", fontWeight: 600 },
      },
    },
    tooltip: {
      y: {
        formatter: (
          _val: number,
          { dataPointIndex }: { dataPointIndex: number }
        ) => {
          const idx = dataPointIndex;
          const usedMB = Number(used[idx]).toLocaleString();
          const totalMB = total[idx].toLocaleString();
          const freeMB = (total[idx] - Number(used[idx])).toLocaleString();
          return `사용: ${usedMB}MB / 여유: ${freeMB}MB / 총 ${totalMB}MB`;
        },
      },
    },
    legend: { show: false },
    grid: { show: false },
  };

  return (
    <div id="stack-chart" style={{ width: "100%", height: "150px" }}>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={150}
      />
    </div>
  );
};

export default StackChart;
