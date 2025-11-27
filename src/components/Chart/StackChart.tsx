import { getCssVar } from "@/styles/utils/getCssVar";
import type { ApexOptions } from "apexcharts";
import React, { useRef, useEffect, useState, useMemo, useCallback, memo } from "react";
import ReactApexChart from "react-apexcharts";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

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
  height?: number | string;
  xMin?: number; // x축,y축 설정 변경
  xMax?: number; // x축,y축 설정 변경
  useActualValue?: boolean; // 실제 값 사용 여부 (percent 계산 안 함)
  xAxisFormatter?: (value: number) => string; // x축 라벨 포맷터
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
  height = 120,
  yaxisTitle,
  xMin, // x축,y축 설정 변경
  xMax, // x축,y축 설정 변경
  useActualValue = false, // 실제 값 사용 여부 (기본값: false - 기존 동작 유지)
  xAxisFormatter, // x축 라벨 포맷터
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedHeight, setCalculatedHeight] = useState<number>(
    typeof height === "number" ? height : 120
  );

  // height가 "100%"인 경우 부모 컨테이너 높이를 계산
  useEffect(() => {
    if (height === "100%" && containerRef.current) {
      const updateHeight = () => {
        const parentHeight = containerRef.current?.parentElement?.clientHeight;
        if (parentHeight && parentHeight > 0) {
          // 헤더 높이와 여유 공간을 고려하여 높이 조정 (약 50px 여유)
          const adjustedHeight = Math.max(120, parentHeight - 50);
          setCalculatedHeight(adjustedHeight);
        }
      };
      updateHeight();
      const resizeObserver = new ResizeObserver(updateHeight);
      if (containerRef.current.parentElement) {
        resizeObserver.observe(containerRef.current.parentElement);
      }
      return () => resizeObserver.disconnect();
    } else if (typeof height === "number") {
      setCalculatedHeight(height);
    }
  }, [height]);
  const _labels = useMemo(
    () => labels.slice(0, stackCount),
    [labels, stackCount]
  );
  const _usage = useMemo(
    () => usage.slice(0, stackCount),
    [usage, stackCount]
  );
  const _total = useMemo(
    () => total.slice(0, stackCount),
    [total, stackCount]
  );

  // 실제 값 모드면 percent 계산 건너뛰고 실제 값 사용
  const displayValues = useMemo(
    () =>
      useActualValue
        ? _usage // 실제 값 그대로 사용
        : _usage.map((v, i) => (v / _total[i]) * 100), // 기존: percent 계산
    [useActualValue, _usage, _total]
  );

  const getColor = useCallback(
    (value: number) => {
      if (useActualValue) {
        // 실제 값 모드에서는 기본 색상 사용
        return getCssVar("sematic-success");
      }
      // percent 모드에서는 colorRules 적용
      const rule = colorRules.find((r) => value >= r.min && value < r.max);
      return rule ? rule.color : getCssVar("gray-300");
    },
    [useActualValue, colorRules]
  );

  const series = useMemo(
    () => [
      {
        name: "Usage",
        data: displayValues.map((val, i) => ({
          x: _labels[i],
          y: val,
          fillColor: getColor(val),
        })),
      },
    ],
    [displayValues, _labels, getColor]
  );

  const options: ApexOptions = useMemo(
    () => ({
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
    dataLabels: { enabled: false },
    xaxis: {
      categories: _labels,
      // max: 100,
      max: xMax ?? 100, // x축,y축 설정 변경
      min: xMin ?? 0, // x축,y축 설정 변경
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
        formatter: xAxisFormatter
          ? (value: number) => xAxisFormatter(value)
          : undefined,
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
      style: {
        fontSize: "10px", // 툴팁 폰트 크기 조정 (기본값보다 작게)
      },
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
    }),
    [
      _labels,
      xMin,
      xMax,
      yaxisTitle,
      xAxisFormatter,
      _usage,
      _total,
      tooltipFormatter,
    ]
  );

  return (
    <div
      ref={containerRef}
      id="stack-chart"
      style={{
        width: "100%",
        maxWidth: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={calculatedHeight}
        width="100%"
      />
    </div>
  );
};

// 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(StackChart);
