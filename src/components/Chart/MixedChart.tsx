import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  memo,
  useCallback,
} from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
  formatNumberWithUnit,
  formatTooltipNumber,
} from "@/utils/numberFormatter";

interface MixedChartProps {
  categories?: string[];
  columnData?: number[];
  lineData?: number[];
  yaxisLeftTitle?: string;
  yaxisRightTitle?: string;
  height?: number | string;
}

const MixedChart: React.FC<MixedChartProps> = ({
  categories = ["Jan 01", "Jan 03", "Jan 05", "Jan 07", "Jan 09", "Jan 11"],
  columnData = [400, 430, 390, 200, 480, 290],
  lineData = [23, 42, 35, 43, 22, 31],
  yaxisLeftTitle = "",
  yaxisRightTitle = "",
  height = 160,
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

  // LineChart와 동일하게 데이터 안전화: NaN, Infinity, -Infinity 제거
  const sanitize = useCallback(
    (data: number[] = []): number[] =>
      data.map((v) => (Number.isFinite(v) ? v : 0)),
    []
  );

  const safeColumnData = useMemo(
    () => sanitize(columnData),
    [columnData, sanitize]
  );
  const safeLineData = useMemo(() => sanitize(lineData), [lineData, sanitize]);

  const series = useMemo(
    () => [
      {
        name: yaxisLeftTitle,
        type: "column" as const,
        data: safeColumnData,
      },
      {
        name: yaxisRightTitle,
        type: "line" as const,
        data: safeLineData,
      },
    ],
    [yaxisLeftTitle, yaxisRightTitle, safeColumnData, safeLineData]
  );

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        stacked: false,
        toolbar: { show: false },
        background: "transparent",
        // LineChart와 동일한 줌/선택 옵션
        zoom: {
          enabled: true,
          type: "x",
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
        width: [0, 3],
        curve: "smooth",
      },
      colors: ["#3B82F6", "#22C55E"],
      dataLabels: {
        enabled: true,
        enabledOnSeries: [1],
        style: {
          fontSize: "11px",
          fontWeight: 600,
          colors: ["#22C55E"],
        },
      },
      plotOptions: {
        bar: {
          columnWidth: "45%",
          borderRadius: 3,
        },
      },
      xaxis: {
        categories,
        labels: {
          style: { fontSize: "11px", colors: "#777" },
        },
      },
      // y축도 LineChart 기준에 맞춰 숫자 포맷 적용
      yaxis: [
        {
          title: {
            text: yaxisLeftTitle || undefined,
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
              colors: "#3B82F6",
            },
          },
        },
        {
          opposite: true,
          title: {
            text: yaxisRightTitle || undefined,
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
              colors: "#22C55E",
            },
          },
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
        theme: "light",
        y: {
          formatter: (val, { seriesIndex, w }) => {
            const name = w.config.series?.[seriesIndex]?.name || "";
            return `${name}: ${formatTooltipNumber(Number(val))}`;
          },
          title: { formatter: () => "" },
        },
      },
      legend: { show: false },
      grid: {
        borderColor: "rgba(0,0,0,0.08)",
        strokeDashArray: 3,
      },
    }),
    [categories, yaxisLeftTitle, yaxisRightTitle]
  );

  return (
    <div
      ref={containerRef}
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
        height={calculatedHeight}
        type="line"
        width="100%"
      />
    </div>
  );
};

// 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(MixedChart);
