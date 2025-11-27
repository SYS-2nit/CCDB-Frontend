/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useEffect, useState, memo } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import {
  formatNumberWithUnit,
  formatTooltipNumber,
} from "@/utils/numberFormatter";

/*
 ******************************************************************
 공동 작성자: 오수경, 최온유
 ******************************************************************
 */

interface LineChartProps {
  legends?: string[];
  showLegend?: boolean;
  seriesData?: number[][];
  categories?: string[];
  yaxisTitle?: string;
  height?: number | string;
  yMin?: number;
  yMax?: number;
  originalTimes?: string[]; // tooltip용 원본 시간 데이터
  xAxisFilter?: (index: number, time: string) => boolean; // X축 레이블 필터링 함수
}

const LineChart: React.FC<LineChartProps> = ({
  legends = ["Series 1"],
  showLegend = false,
  seriesData = [],
  categories = [],
  yaxisTitle = "",
  height = 150,
  yMin,
  yMax,
  originalTimes = [],
  xAxisFilter,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedHeight, setCalculatedHeight] = useState<number>(
    typeof height === "number" ? height : 150
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

  // series 데이터 메모이제이션 - legends와 seriesData가 변경될 때만 재계산
  const series = useMemo(() => {
    return legends.map((name, i) => ({
      name,
      data: sanitizeData(seriesData[i] || []),
    }));
  }, [legends, seriesData]);

  /** Apex 옵션 메모이제이션 - 관련 props가 변경될 때만 재계산 */
  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "line",
        toolbar: { show: false },
        background: "transparent",
        animations: { enabled: true },
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
        curve: "smooth",
        width: 2.0,
      },
      colors,
      grid: {
        borderColor: "rgba(0,0,0,0.08)",
        strokeDashArray: 3,
        padding: {
          top:
            yMin !== undefined && yMax !== undefined && yMax - yMin < 1 ? 0 : 5, // 위아래 패딩 줄이기
          right: 5,
          bottom: 0,
          left: 10,
        },
      },

      /** X축 포맷 */
      xaxis: {
        categories,
        labels: {
          rotate: -45,
          style: {
            colors: "#777",
            fontSize: "10px",
          },
          hideOverlappingLabels: true,
          formatter: (value: string, opts?: any) => {
            // X축 필터링이 있으면 필터링 적용
            if (
              xAxisFilter &&
              originalTimes.length > 0 &&
              opts &&
              opts.dataPointIndex !== undefined
            ) {
              const index = opts.dataPointIndex;
              if (
                index >= 0 &&
                index < originalTimes.length &&
                originalTimes[index]
              ) {
                const shouldShow = xAxisFilter(index, originalTimes[index]);
                if (!shouldShow) {
                  return ""; // 필터링된 레이블은 빈 문자열 반환 (표시 안됨)
                }
              }
            }
            return value;
          },
        },
        axisTicks: { show: false },
        axisBorder: { show: true }, // 최온유가 x축 경계 너무 안보여서수정함
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
          formatter: (val) => {
            const num = Number(val);
            if (!Number.isFinite(num)) return "0";
            // 작은 범위일 때 소수점 표시
            if (yMin !== undefined && yMax !== undefined && yMax - yMin < 1) {
              // 소수점 1자리로 고정
              const rounded = Math.round(num * 10) / 10;
              return rounded.toFixed(1);
            }
            return formatNumberWithUnit(num);
          },
          style: {
            fontSize: "11px",
            colors: "#777",
          },
        },
        axisBorder: {
          show: true,
          color: "rgba(0,0,0,0,1)",
        },
        axisTicks: {
          show: false,
        },
        min: yMin !== undefined && Number.isFinite(yMin) ? yMin : 0,
        max: yMax !== undefined && Number.isFinite(yMax) ? yMax : undefined,
        // 작은 범위일 때 틱 간격 제어 (수정)
        // 작은 범위일 때 틱 간격 제어 (수정)
        ...(yMin !== undefined && yMax !== undefined && yMax - yMin < 1
          ? {
              tickAmount: 5,
              forceNiceScale: false,
              floating: false,
              decimalsInFloat: 2, // 추가: 소수점 자릿수 제한
            }
          : {}),
      },

      dataLabels: { enabled: false },

      legend: {
        show: showLegend,
        showForSingleSeries: true, // 추가: 단일 시리즈일 때도 범례 표시
        position: "right",
        fontSize: "11px",
        itemMargin: { horizontal: 5, vertical: 3 },
        markers: {
          size: 4,
        },
        floating: false,
        height: undefined,
        containerMargin: { top: 0, right: 0, bottom: 0, left: 0 },
        formatter: (seriesName: string) => {
          // 긴 이름은 줄임표로 처리
          return seriesName.length > 15
            ? `${seriesName.substring(0, 15)}...`
            : seriesName;
        },
      },

      tooltip: {
        theme: "light",
        x: {
          formatter: (val: any, opts?: any) => {
            // 원본 시간이 있으면 tooltip에 원본 시간 표시
            if (
              originalTimes.length > 0 &&
              opts &&
              opts.dataPointIndex !== undefined &&
              opts.dataPointIndex >= 0 &&
              opts.dataPointIndex < originalTimes.length
            ) {
              const originalTime = originalTimes[opts.dataPointIndex];
              if (originalTime) {
                const d = new Date(originalTime);
                if (!isNaN(d.getTime())) {
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  const HH = String(d.getHours()).padStart(2, "0");
                  const MM = String(d.getMinutes()).padStart(2, "0");
                  return `${mm}-${dd} ${HH}:${MM}`;
                }
              }
            }
            return val;
          },
        },
        y: {
          formatter: (val) => formatTooltipNumber(Number(val)),
        },
      },
    }),
    [categories, yaxisTitle, yMin, yMax, showLegend, originalTimes, xAxisFilter]
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={calculatedHeight}
        width="100%"
      />
    </div>
  );
};

// 성능 최적화: React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(LineChart);
