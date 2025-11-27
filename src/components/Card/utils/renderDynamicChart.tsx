/****************************************
공동 작성자 : 배지원 최온유
 ****************************************/

/* eslint-disable no-case-declarations */
import React from "react";
import { mainChartRenderer } from "../chartRenderers/mainChartRenderer";
import LineChart from "@/components/Chart/LineChart";
import GaugeChart from "@/components/Chart/GaugeChart";
import MetricGrid, { type MetricData } from "@/components/Card/MetricCard";
import StackChart from "@/components/Chart/StackChart";
import MixedChart from "@/components/Chart/MixedChart";
import SuccessGreenIcon from "@/assets/general/succes-green.svg";
import ErrorRedIcon from "@/assets/general/error-red.svg";
import type { GraphDataResponse } from "@/api/Dashboard/dashboard";
import type { DashboardMode } from "@/state/DashboardContext";

// 그래프 ID별 축 범위 설정 (필요할 때만 추가)
const GRAPH_AXIS_RANGES: Record<
  number,
  { yMin?: number; yMax?: number; xMin?: number; xMax?: number }
> = {
  2: { yMin: 0, yMax: 2 },
  3: { yMin: 0, yMax: 1 },
  5: { yMin: 0, yMax: 1 },
  15: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  16: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  14: { yMin: 0, yMax: 0.5 }, // x축,y축 설정 변경
  17: { yMin: 0, yMax: 2 }, // x축,y축 설정 변경
  18: { yMin: 0, yMax: 50 }, // x축,y축 설정 변경
  19: { yMin: 0, yMax: 0.5 }, // x축,y축 설정 변경
  20: { xMin: 0, xMax: 1000 }, // x축,y축 설정 변경 ----- 막대
  // Memory
  23: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  24: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  25: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  26: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  27: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  28: { xMin: 0, xMax: 160000 }, // x축,y축 설정 변경 ----- 막대 막대 막대
  // Session
  29: { yMin: 0, yMax: 20 }, // x축,y축 설정 변경
  30: { yMin: 0, yMax: 2 }, // x축,y축 설정 변경
  31: { yMin: 0, yMax: 10 }, // x축,y축 설정 변경
  32: { yMin: 0, yMax: 3 }, // x축,y축 설정 변경
  33: { yMin: 0, yMax: 500 }, // x축,y축 설정 변경
  34: { yMin: 0, yMax: 10 }, // x축,y축 설정 변경
  36: { xMin: 0, xMax: 10 }, // x축,y축 설정 변경 ----- 막대

  // I/O
  38: { yMin: 0, yMax: 5 }, // x축,y축 설정 변경
  39: { yMin: 0, yMax: 30 }, // x축,y축 설정 변경 ----------- sql_parse_execute_ration 만 남기면 0~30으로 변경
  40: { yMin: 0, yMax: 10000 }, // x축,y축 설정 변경
  41: { yMin: 0, yMax: 5 }, // x축,y축 설정 변경
  42: { yMin: 0, yMax: 0.5 }, // x축,y축 설정 변경
  43: { yMin: 0, yMax: 10 }, // x축,y축 설정 변경
  44: { xMin: 0, xMax: 100 }, // x축,y축 설정 변경 -- 막대

  // Storage
  46: { yMin: 0, yMax: 0.1 }, // x축,y축 설정 변경
  47: { yMin: 0, yMax: 5 }, // x축,y축 설정 변경
  48: { xMin: 0, xMax: 2 }, // x축,y축 설정 변경
  49: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  50: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  51: { yMin: 0, yMax: 100 }, // x축,y축 설정 변경
  // 52: { xMin: 0, xMax: 10 }, // x축,y축 설정 변경 ----------- GB -> MB 변경 시 0~1500 으로 변경 -- 막대
}; // x축,y축 설정 변경

// 그래프 ID별 제목 suffix 포맷터 (필요할 때만 추가)
export const GRAPH_TITLE_SUFFIX_FORMATTERS: Record<
  number,
  (graph: GraphDataResponse) => string | null
> = {
  46: (graph: GraphDataResponse) => {
    const sorted = sortPoints(graph);
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];

    // 서버에서 받은 키 찾기 (대소문자 무시)
    const findValue = (keys: string[]): number | null => {
      for (const key of keys) {
        const value = latest.values?.[key];
        if (value !== null && value !== undefined) {
          const num = typeof value === "number" ? value : Number(value);
          return Number.isFinite(num) ? num : null;
        }
      }
      return null;
    };

    const activeUsage = findValue([
      "TEMP_ACTIVE_USAGE_GB",
      "temp_active_usage_gb",
    ]);
    const currentSize = findValue([
      "TEMP_CURRENT_SIZE_GB",
      "temp_current_size_gb",
    ]);
    const maxSize = findValue(["TEMP_MAX_SIZE_GB", "temp_max_size_gb"]);
    const usagePercent = findValue([
      "TEMP_USAGE_PERCENT",
      "temp_usage_percent",
    ]);
    const usagePctOfMax = findValue([
      "TEMP_USAGE_PCT_OF_MAX",
      "temp_usage_pct_of_max",
    ]);

    const formatNumber = (val: number | null): string => {
      if (val === null) return "-";
      return val.toFixed(1);
    };

    const parts: string[] = [];
    if (activeUsage !== null) parts.push(`${formatNumber(activeUsage)}GB`);
    if (currentSize !== null) parts.push(`${formatNumber(currentSize)}GB`);
    if (maxSize !== null) parts.push(`${formatNumber(maxSize)}GB`);

    const percentageParts: string[] = [];
    if (usagePercent !== null)
      percentageParts.push(`할당대비 ${Math.round(usagePercent)}%`);
    if (usagePctOfMax !== null)
      percentageParts.push(`최대대비 ${Math.round(usagePctOfMax)}%`);

    if (parts.length === 0) return null;

    const mainInfo = parts.join(" / ");
    const percentageInfo =
      percentageParts.length > 0 ? ` (${percentageParts.join(", ")})` : "";

    return `${mainInfo}${percentageInfo}`;
  },
  49: (graph: GraphDataResponse) => {
    const sorted = sortPoints(graph);
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];

    // 서버에서 받은 키 찾기 (대소문자 무시)
    const findValue = (keys: string[]): number | null => {
      for (const key of keys) {
        const value = latest.values?.[key];
        if (value !== null && value !== undefined) {
          const num = typeof value === "number" ? value : Number(value);
          return Number.isFinite(num) ? num : null;
        }
      }
      return null;
    };

    const spaceLimitGB = findValue(["SPACE_LIMIT_GB", "space_limit_gb"]);
    const spaceUsedGB = findValue(["SPACE_USED_GB", "space_used_gb"]);

    // 값이 없으면 null 반환
    if (spaceLimitGB === null && spaceUsedGB === null) return null;

    // 정수로 포맷팅 (소수점 제거)
    const formatInteger = (val: number | null): string => {
      if (val === null) return "-";
      return Math.round(val).toString();
    };

    const parts: string[] = [];
    if (spaceUsedGB !== null) parts.push(`${formatInteger(spaceUsedGB)} GB`);
    if (spaceLimitGB !== null) parts.push(`${formatInteger(spaceLimitGB)} GB`);

    if (parts.length === 0) return null;

    return parts.join(" / ");
  },
};

const ensureNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    // NaN, Infinity, -Infinity 모두 필터링
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    // NaN, Infinity, -Infinity 모두 필터링
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "boolean") return value ? 1 : 0;
  return null;
};

const sortPoints = (graph: GraphDataResponse) => {
  const points = graph.data ?? [];
  return [...points].sort((a, b) => {
    const timeA = new Date(a.timestamp ?? 0).getTime();
    const timeB = new Date(b.timestamp ?? 0).getTime();
    return timeA - timeB;
  });
};

/**
 * 값을 "nice" number로 올림 처리하여 일관된 축 라벨 간격을 보장합니다.
 * @param value 원본 값
 * @returns nice number로 올림 처리된 값
 * @example
 * roundUpToNiceNumber(83.028) // 100
 * roundUpToNiceNumber(156.7) // 200
 * roundUpToNiceNumber(0.083) // 0.1
 * roundUpToNiceNumber(120) // 120 (이미 nice 값)
 */
const roundUpToNiceNumber = (value: number): number => {
  // 0이거나 유효하지 않은 값은 그대로 반환
  if (!Number.isFinite(value) || value <= 0) {
    return value;
  }

  // 이미 깔끔한 값인지 확인 (정수이고 1, 2, 5, 10, 20, 50, 100... 계열인지)
  const magnitude = Math.floor(Math.log10(value));
  const normalized = value / Math.pow(10, magnitude);

  // 이미 nice 값인 경우 (1, 2, 5 계열) 그대로 반환
  if (
    (normalized >= 0.95 && normalized <= 1.05) || // ~1
    (normalized >= 1.9 && normalized <= 2.1) || // ~2
    (normalized >= 4.9 && normalized <= 5.1) || // ~5
    (normalized >= 9.5 && normalized <= 10.5) // ~10
  ) {
    return value;
  }

  // Nice number 간격 리스트: [1, 2, 5]
  const niceSteps = [1, 2, 5];

  // 현재 normalized 값보다 큰 첫 번째 nice step 찾기
  let niceStep = niceSteps.find((step) => step >= normalized);

  // 현재 normalized 값이 5보다 크면 다음 자릿수로 올림 (예: 7 → 10)
  if (!niceStep) {
    niceStep = 10;
  }

  // 자릿수를 곱해서 원래 스케일로 복원
  return niceStep * Math.pow(10, magnitude);
};

/**
 * 타임스탬프를 Asia/Seoul 타임존 기준으로 포맷팅
 * 백엔드에서 LocalDateTime을 전송할 때 타임존 정보가 없으므로,
 * 명시적으로 Asia/Seoul 타임존으로 해석하여 포맷팅합니다.
 */
const formatTime = (timestamp: string, mode: DashboardMode = "LIVE") => {
  if (!timestamp) return timestamp;

  // 백엔드에서 보낸 timestamp는 "2025-01-11T23:59:00" 형식 (타임존 없음)
  // 또는 배열 형식: ["2025", "01", "11", "23", "59", "00"]
  // 이를 Asia/Seoul 타임존으로 해석하기 위해 타임존을 명시적으로 추가
  let date: Date;

  try {
    // 타임존 정보 확인 (Z, +, - 뒤에 숫자가 있는지)
    const hasTimezone = /[Zz]|[+-]\d{2}:?\d{2}$/.test(timestamp);

    if (!hasTimezone) {
      // 타임존 정보가 없는 경우: "2025-01-11T23:59:00"
      // Asia/Seoul 타임존(+09:00)으로 해석
      // ISO 8601 형식에 타임존을 추가
      if (timestamp.includes("T")) {
        date = new Date(timestamp + "+09:00");
      } else {
        // 날짜만 있는 경우 (YYYY-MM-DD)
        date = new Date(timestamp + "T00:00:00+09:00");
      }
    } else if (timestamp.endsWith("Z") || timestamp.endsWith("z")) {
      // UTC인 경우 (Z로 끝남)
      date = new Date(timestamp);
    } else {
      // 이미 타임존 정보가 있는 경우
      date = new Date(timestamp);
    }

    if (Number.isNaN(date.getTime())) {
      console.warn(`[formatTime] Invalid timestamp: ${timestamp}`);
      return timestamp;
    }
  } catch (error) {
    console.warn(`[formatTime] Error parsing timestamp: ${timestamp}`, error);
    return timestamp;
  }

  // 모드에 따라 시간 포맷 변경
  switch (mode) {
    case "LIVE": {
      // 24시간 형식으로 포맷팅 (HH:mm)
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    case "10분": {
      // 10분 단위: 24시간 형식 (HH:mm)
      const hours10 = String(date.getHours()).padStart(2, "0");
      const minutes10 = String(date.getMinutes()).padStart(2, "0");
      return `${hours10}:${minutes10}`;
    }
    case "1시간": {
      // 1시간 단위: 24시간 형식 (HH:mm)
      const hours1h = String(date.getHours()).padStart(2, "0");
      const minutes1h = String(date.getMinutes()).padStart(2, "0");
      return `${hours1h}:${minutes1h}`;
    }
    case "1일":
      // 1일 단위: 날짜만 표시 (MM.DD 형식)
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}.${day}`;
    default: {
      // 24시간 형식으로 포맷팅 (HH:mm)
      const defaultHours = String(date.getHours()).padStart(2, "0");
      const defaultMinutes = String(date.getMinutes()).padStart(2, "0");
      return `${defaultHours}:${defaultMinutes}`;
    }
  }
};

const clampPercentage = (value: number) => Math.max(0, Math.min(100, value));

const renderGauge = (graph: GraphDataResponse, valueKey: string) => {
  // 타임스탬프 기준으로 내림차순 정렬 (가장 최근 데이터가 첫 번째)
  const points = graph.data ?? [];
  const sorted = [...points].sort((a, b) => {
    const timeA = new Date(a.timestamp ?? 0).getTime();
    const timeB = new Date(b.timestamp ?? 0).getTime();
    return timeB - timeA; // 내림차순 정렬 (최신이 먼저)
  });

  if (sorted.length === 0) return null;

  // 가장 최근 데이터 (정렬 후 첫 번째)
  const latest = sorted[0];
  const value = ensureNumber(latest.values?.[valueKey]);
  if (value === null) return null;
  return <GaugeChart value={clampPercentage(value)} />;
};

const renderMetricTiles = (
  graph: GraphDataResponse,

  mappings: Array<{
    key: string;
    label: string;
    subtitle?: string; // 직접 지정할 수 있는 subtitle (label과 분리)
    suffix?: string;
    subtitleKeys?: string[]; // 서브 값으로 표시할 키 배열 (예: ["key1", "key2"])
    decimals?: number; // 추가: 메인 값 소수점 자릿수 (반올림)
    truncateDecimals?: number; // 추가: 버림용 소수점 자릿수 (truncateDecimals가 설정되면 버림, decimals는 반올림)
    divisor?: number; // 추가: 메인 값에 적용할 나눌 값
    subtitleDivisor?: number; // 추가: 서브타이틀 값에 적용할 나눌 값
    subtitleDecimals?: number; // 추가: 서브타이틀 값 소수점 자릿수
    subtitleSuffix?: string; // 추가: 서브타이틀 값 뒤에 붙일 단위 (예: "MB")
    subtitleFirstSuffix?: string; // 추가: 서브타이틀 첫 번째 값 뒤에 붙일 단위 (예: "active")
  }>,
  columns = 2
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];

  // 서버에서 받은 실제 키 목록 (대소문자 포함)
  const availableKeys = Object.keys(latest.values ?? {});

  // 하드코딩된 키를 서버의 실제 키로 매칭 (대소문자 무시)
  const findMatchingKey = (requestedKey: string): string | null => {
    const lowerRequested = requestedKey.toLowerCase();
    // 정확히 일치하는 경우
    if (availableKeys.includes(requestedKey)) {
      return requestedKey;
    }
    // 대소문자 무시 매칭
    const matched = availableKeys.find(
      (k) => k.toLowerCase() === lowerRequested
    );
    return matched ?? null;
  };

  const metrics: MetricData[] = mappings.map(
    ({
      key,
      label,
      subtitle: directSubtitle,
      suffix,
      subtitleKeys,
      decimals,
      truncateDecimals,
      divisor,
      subtitleDivisor,
      subtitleDecimals,
      subtitleSuffix,
      subtitleFirstSuffix,
    }) => {
      // decimals 추가
      // Shared Pool 사용률 계산 (특별 처리)
      let numeric: number | null = null;
      let matchedKey: string | null = null;
      if (key === "shared_pool_usage_pct_calc") {
        const sharedPoolBytes = ensureNumber(
          latest.values?.[findMatchingKey("shared_pool_bytes") ?? ""]
        );
        const sharedPoolFreeBytes = ensureNumber(
          latest.values?.[findMatchingKey("shared_pool_free_bytes") ?? ""]
        );
        if (
          sharedPoolBytes !== null &&
          sharedPoolFreeBytes !== null &&
          sharedPoolBytes > 0
        ) {
          numeric =
            ((sharedPoolBytes - sharedPoolFreeBytes) / sharedPoolBytes) * 100;
        }
      } else if (key === "pga_used_bytes" && label === "OS 메모리 사용률") {
        // OS 메모리 사용률 계산: (pga_used_bytes GB + 4.45) / 7.47 * 100
        const pgaUsedBytes = ensureNumber(
          latest.values?.[findMatchingKey("pga_used_bytes") ?? ""]
        );
        if (pgaUsedBytes !== null) {
          const pgaUsedGB = pgaUsedBytes / 1_073_741_824; // GB 변환
          const totalUsed = pgaUsedGB + 4.45;
          numeric = (totalUsed / 7.47) * 100; // 퍼센트 계산
        }
      } else {
        matchedKey = findMatchingKey(key);
        if (!matchedKey) {
          console.warn(
            `컬럼 '${key}'를 찾을 수 없습니다. 사용 가능한 키:`,
            availableKeys
          );
          return {
            title: label,
            value: "-",
            subtitle: "",
          };
        }
        numeric = ensureNumber(latest.values?.[matchedKey]);
      }

      const finalNumeric =
        divisor && numeric !== null ? numeric / divisor : numeric; // 추가
      let display: string | number = "-";

      if (finalNumeric !== null) {
        // truncateDecimals가 있으면 버림 처리 (가장 높은 우선순위)
        if (truncateDecimals !== undefined) {
          const multiplier = Math.pow(10, truncateDecimals);
          const truncated = Math.floor(finalNumeric * multiplier) / multiplier;
          const fixed = truncated.toFixed(truncateDecimals);
          const trimmed = parseFloat(fixed).toString(); // 불필요한 0 제거
          display = suffix ? `${trimmed}${suffix}` : trimmed;
        }
        // decimals가 있으면 HEAD 브랜치 방식 (소수점 지정, 반올림)
        else if (decimals !== undefined) {
          const fixed = finalNumeric.toFixed(decimals);
          const trimmed = parseFloat(fixed).toString(); // 불필요한 0 제거
          display = suffix ? `${trimmed}${suffix}` : trimmed;
        }
        // decimals가 없으면 dev 브랜치 방식 (기존 로직)
        else if (suffix === "%") {
          display = `${finalNumeric.toFixed(1)}%`;
        } else if (suffix) {
          display = `${finalNumeric.toLocaleString()} ${suffix}`;
        } else {
          display = finalNumeric.toLocaleString();
        }
      }

      // 문자열 처리 추가

      if (
        display === "-" &&
        matchedKey &&
        typeof latest.values?.[matchedKey] === "string"
      ) {
        display = String(latest.values?.[matchedKey]);
      }

      // 서브 값 생성
      // 직접 지정된 subtitle이 있으면 우선 사용
      let subtitle = directSubtitle || "";
      if (!directSubtitle && subtitleKeys && subtitleKeys.length > 0) {
        const subtitleValues = subtitleKeys
          .map((subKey) => {
            // Shared Pool 사용량 계산 (특별 처리)
            let subNumeric: number | null = null;
            if (subKey === "shared_pool_usage_bytes_calc") {
              const sharedPoolBytes = ensureNumber(
                latest.values?.[findMatchingKey("shared_pool_bytes") ?? ""]
              );
              const sharedPoolFreeBytes = ensureNumber(
                latest.values?.[findMatchingKey("shared_pool_free_bytes") ?? ""]
              );
              if (sharedPoolBytes !== null && sharedPoolFreeBytes !== null) {
                subNumeric = sharedPoolBytes - sharedPoolFreeBytes;
              }
            } else if (subKey === "os_memory_used_calc") {
              // OS 메모리 사용량 계산: pga_used_bytes를 GB로 변환 후 + 4.45
              const pgaUsedBytes = ensureNumber(
                latest.values?.[findMatchingKey("pga_used_bytes") ?? ""]
              );
              if (pgaUsedBytes !== null) {
                const pgaUsedGB = pgaUsedBytes / 1_073_741_824; // GB 변환
                subNumeric = pgaUsedGB + 4.45;
              }
            } else if (subKey === "os_memory_total_calc") {
              // OS 메모리 총량: 고정값 7.47 GB
              subNumeric = 7.47;
            } else {
              const matchedSubKey = findMatchingKey(subKey);
              if (!matchedSubKey) return null;
              const rawValue = latest.values?.[matchedSubKey];
              subNumeric = ensureNumber(rawValue);

              // 문자열인 경우 그대로 반환
              if (subNumeric === null && typeof rawValue === "string") {
                return rawValue;
              }
            }

            const finalSubNumeric =
              subtitleDivisor && subNumeric !== null
                ? subNumeric / subtitleDivisor
                : subNumeric;
            if (finalSubNumeric === null) return null;
            let formattedValue: string;
            if (subtitleDecimals !== undefined) {
              const fixed = finalSubNumeric.toFixed(subtitleDecimals);
              formattedValue = parseFloat(fixed).toString(); // 불필요한 0 제거
            } else {
              formattedValue = finalSubNumeric.toLocaleString();
            }
            return formattedValue;
          })
          .filter((v): v is string => v !== null);

        if (subtitleValues.length > 0) {
          // subtitleFirstSuffix가 있으면 각 값에 개별 suffix 적용
          if (subtitleFirstSuffix) {
            const formattedValues = subtitleValues.map((val, index) => {
              if (index === 0 && subtitleFirstSuffix) {
                return `${val} ${subtitleFirstSuffix}`;
              } else if (index === 1 && subtitleSuffix) {
                return `${val} ${subtitleSuffix}`;
              }
              return val;
            });
            subtitle = formattedValues.join(" / ");
          } else {
            // 기존 방식: 모든 값 뒤에 subtitleSuffix 붙이기
            subtitle = subtitleValues.join(" / ");
            if (subtitleSuffix) {
              subtitle += ` ${subtitleSuffix}`;
            }
          }
        }
      }

      return {
        title: label,
        value: display,
        subtitle: subtitle,
      };
    }
  );

  return <MetricGrid metrics={metrics} columns={columns} height="100%" />;
};

const renderBackgroundMetrics = (graph: GraphDataResponse) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];

  const processes: Array<{ key: string; label: string }> = [
    { key: "lgwr_active", label: "LGWR" },
    { key: "dbwr_active", label: "DBWR" },
    { key: "pmon_active", label: "PMON" },
    { key: "smon_active", label: "SMON" },
    { key: "ckpt_active", label: "CKPT" },
    { key: "arcn_active", label: "ARC" },
  ];

  const metrics: MetricData[] = processes.map(({ key, label }) => {
    const numeric = ensureNumber(latest.values?.[key]);
    const isActive =
      numeric !== null ? numeric > 0 : latest.values?.[key] === "Y";
    return {
      title: label,
      icon: isActive ? SuccessGreenIcon : ErrorRedIcon,
      subtitle: isActive ? "정상" : "오류",
    };
  });

  return <MetricGrid metrics={metrics} columns={3} height="100%" />;
};

const renderLine = (
  graph: GraphDataResponse,
  config: { keys: string[]; legends: string[] },
  mode: DashboardMode = "LIVE"
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) {
    // 데이터가 없어도 빈 차트를 표시하여 그래프가 사라지지 않도록 함
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
        }}
      >
        데이터가 없습니다.
      </div>
    );
  }

  // 서버에서 받은 실제 키 목록 (대소문자 포함)
  const availableKeys =
    sorted.length > 0 ? Object.keys(sorted[0].values ?? {}) : [];

  // 하드코딩된 키를 서버의 실제 키로 매칭 (대소문자 무시)
  const findMatchingKey = (requestedKey: string): string | null => {
    const lowerRequested = requestedKey.toLowerCase();
    // 정확히 일치하는 경우
    if (availableKeys.includes(requestedKey)) {
      return requestedKey;
    }
    // 대소문자 무시 매칭
    const matched = availableKeys.find(
      (k) => k.toLowerCase() === lowerRequested
    );
    return matched ?? null;
  };

  const categories = sorted.map((point) => formatTime(point.timestamp, mode));
  const matchedKeys: string[] = [];
  const seriesData = config.keys.map((key) => {
    const matchedKey = findMatchingKey(key);
    if (!matchedKey) {
      console.warn(
        `컬럼 '${key}'를 찾을 수 없습니다. 사용 가능한 키:`,
        availableKeys
      );
      return null; // 매칭 실패 시 null 반환
    }
    matchedKeys.push(matchedKey);
    // NaN, Infinity, -Infinity를 필터링하고 null을 0으로 변환
    return sorted.map((point) => {
      const num = ensureNumber(point.values?.[matchedKey]);
      // null이거나 유효하지 않은 숫자는 0으로 변환 (또는 null로 유지하여 나중에 필터링)
      return num !== null && Number.isFinite(num) ? num : 0;
    });
  });

  // 모든 키가 매칭되지 않으면 빈 차트 표시
  if (matchedKeys.length === 0) {
    console.warn(
      `그래프 '${
        graph.name || "Unknown"
      }'의 모든 컬럼을 찾을 수 없습니다. 사용 가능한 키:`,
      availableKeys
    );
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
        }}
      >
        컬럼을 찾을 수 없습니다.
      </div>
    );
  }

  // null이 아닌 시리즈만 필터링하고, 각 시리즈의 데이터에서 NaN/Infinity 제거
  const validSeriesData = seriesData
    .filter((data): data is number[] => data !== null)
    .map((data) =>
      // 각 시리즈 데이터에서 NaN, Infinity, -Infinity를 필터링하고 유효한 값만 유지
      data.map((v) => (Number.isFinite(v) ? v : 0))
    );
  const validLegends = config.legends.filter(
    (_, index) => seriesData[index] !== null
  );

  // y축 범위를 데이터에 맞게 자동 조정 (최소값은 0으로 고정)
  const allValues = validSeriesData.flat().filter((v) => Number.isFinite(v));
  if (allValues.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9ca3af",
        }}
      >
        데이터가 없습니다.
      </div>
    );
  }

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.1 || 1;

  // maxValue가 유효하지 않으면 기본값 설정
  const safeMaxValue = Number.isFinite(maxValue) ? maxValue : 100;
  const safePadding = Number.isFinite(padding) ? padding : 10;

  return (
    <LineChart
      legends={validLegends}
      categories={categories}
      seriesData={validSeriesData}
      showLegend={validLegends.length >= 1}
      height="100%" // 카드 높이에 맞게 동적 조정
      // yMin={0}
      // yMax={safeMaxValue + safePadding}
      yMin={GRAPH_AXIS_RANGES[graph.id]?.yMin ?? 0} // x축,y축 설정 변경
      yMax={(() => {
        // x축,y축 설정 변경
        const configuredYMax = GRAPH_AXIS_RANGES[graph.id]?.yMax;
        const calculatedYMax = safeMaxValue + safePadding;
        // 설정된 max가 있으면, 계산된 max가 설정된 max를 넘을 때만 120% 적용
        let rawYMax: number;
        if (configuredYMax !== undefined) {
          rawYMax =
            calculatedYMax > configuredYMax
              ? calculatedYMax * 1.2
              : configuredYMax;
        } else {
          // 설정된 max가 없으면 계산된 max의 120% 사용
          rawYMax = calculatedYMax * 1.2;
        }
        // Nice number로 올림 처리하여 일관된 축 라벨 간격 보장
        return roundUpToNiceNumber(rawYMax);
      })()} // x축,y축 설정 변경
    />
  );
};

const renderStack = (
  graph: GraphDataResponse,
  labels: string[],
  keys: string[],
  tooltipFormatter?: (
    data: { used: number; total: number; percent: number },
    index: number
  ) => string,
  xAxisFormatter?: (value: number) => string
) => {
  const sorted = sortPoints(graph);
  if (sorted.length === 0) return null;
  const latest = sorted[sorted.length - 1];

  const usage = keys.map((key) => ensureNumber(latest.values?.[key]) ?? 0);
  const totals = keys.map(() => 40000);

  const axisRange = GRAPH_AXIS_RANGES[graph.id]; // x축,y축 설정 변경
  // 실제 값의 최댓값 계산
  const actualMaxValue = Math.max(...usage, 0);
  const configuredXMax = axisRange?.xMax ?? 100;
  // 실제 값이 설정된 상한을 넘을 때만 120% 적용, 그렇지 않으면 설정된 상한값 그대로 사용
  const rawXMax =
    actualMaxValue > configuredXMax ? actualMaxValue * 1.2 : configuredXMax;
  // Nice number로 올림 처리하여 일관된 축 라벨 간격 보장
  const finalXMax = roundUpToNiceNumber(rawXMax);
  // 20번 그래프는 실제 값(ms)을 표시해야 하므로 실제 값 모드 사용
  const useActualValue =
    graph.id === 20 || graph.id === 28 || graph.id === 44 || graph.id === 48;
  return (
    <StackChart
      labels={labels}
      usage={usage}
      total={totals}
      xMin={axisRange?.xMin} // x축,y축 설정 변경
      xMax={finalXMax} // x축,y축 설정 변경
      tooltipFormatter={tooltipFormatter}
      colorRules={[
        { min: 0, max: 69, color: "#22C55E" },
        { min: 70, max: 84, color: "#FACC15" },
        { min: 85, max: 100, color: "#EF4444" },
      ]}
      height="100%" // 카드 높이에 맞게 동적 조정
      useActualValue={useActualValue}
      xAxisFormatter={xAxisFormatter}
    />
  );
};

export const renderDynamicChart = (
  title: string,
  graph: GraphDataResponse | null | undefined,
  mode: DashboardMode = "LIVE",
  allGraphsInCategory?: GraphDataResponse[]
): React.ReactNode => {
  if (!graph) return null;

  // Graph ID 8: 세션 한도/급증
  // GraphRegistry: session_usage_pct

  if (graph.id === 8) {
    return renderGauge(graph, "session_usage_pct");
  }

  if (graph.id === 1) {
    return renderMetricTiles(graph, [
      { key: "workarea_spill_rate_pct", label: "Spill Rate %", suffix: "%" },
      { key: "spill_mb_per_min", label: "Spill MB/min" },
      { key: "hard_parses_per_sec", label: "Hard Parses/s" },
      {
        key: "library_cache_reloads_per_sec",
        label: "Library Cache Reloads/s",
      },
    ]);
  }

  if (graph.id === 11) {
    return renderBackgroundMetrics(graph);
  }

  // Graph ID 3: Wait Class 분포
  // GraphRegistry: WAIT_CLASS_AAS_USER_IO, WAIT_CLASS_AAS_COMMIT, WAIT_CLASS_AAS_CONCURRENCY,
  //                WAIT_CLASS_AAS_SYSTEM_IO, WAIT_CLASS_AAS_NETWORK, WAIT_CLASS_AAS_CLUSTER, WAIT_CLASS_AAS_OTHER, AAS_TOTAL
  if (graph.id === 3) {
    return renderLine(
      graph,
      {
        keys: [
          "wait_class_aas_user_io",
          "wait_class_aas_commit",
          "wait_class_aas_concurrency",
          "wait_class_aas_system_io",
          "wait_class_aas_network",
          "wait_class_aas_cluster",
          "wait_class_aas_other",
        ],
        legends: [
          "User I/O",
          "Commit",
          "Concurrency",
          "System I/O",
          "Network",
          "Cluster",
          "Other",
        ],
      },
      mode
    );
  }
  // --------------------------------------------------------------- 머지 직전 ---------------------

  // Graph ID 4: CPU 사용(호스트 vs DB CPU)
  // GraphRegistry: HOST_CPU_UTIL_PCT, CPU_SATURATION_PCT

  if (graph.id === 4) {
    return renderLine(
      graph,
      {
        keys: ["host_cpu_util_pct", "cpu_saturation_pct"],
        legends: ["Host CPU Util (%)", "CPU Saturation (%)"],
      },
      mode
    );
  }

  if (graph.id === 12) {
    return renderLine(
      graph,
      {
        keys: [
          "processes_usage_pct",
          "sessions_usage_pct",
          "open_cursors_max_session_pct",
        ],
        legends: ["processes", "sessions", "open_cursors"],
      },
      mode
    );
  }

  if (graph.id === 5) {
    return renderLine(
      graph,
      {
        keys: [
          "single_block_read_latency_ms",
          "direct_path_read_latency_ms",
          "direct_path_write_latency_ms",
        ],
        legends: ["Single Read (ms)", "Direct Read (ms)", "Direct Write (ms)"],
      },
      mode
    );
  }

  if (graph.id === 6) {
    return renderLine(
      graph,
      {
        keys: ["physical_read_mb_per_sec", "physical_write_mb_per_sec"],
        legends: ["Read MB/s", "Write MB/s"],
      },
      mode
    );
  }

  // Graph ID 7: SGA 압박(FreeMB/Reloads)
  // GraphRegistry: LIBRARY_CACHE_HIT_PCT, DICTIONARY_CACHE_HIT_PCT, HARD_PARSE_RATIO_PCT

  if (graph.id === 7) {
    return renderMetricTiles(
      graph,
      [
        {
          key: "library_cache_hit_pct",
          label: "Library Cache Hit (%)",
          suffix: "%",
        },
        {
          key: "dictionary_cache_hit_pct",
          label: "Dictionary Cache Hit (%)",
          suffix: "%",
        },
        {
          key: "hard_parse_ratio_pct",
          label: "Hard Parse Ratio (%)",
          suffix: "%",
        },
      ],
      3
    );
  }

  if (graph.id === 9) {
    return renderGauge(graph, "fra_usage_pct");
  }

  // Graph ID 2: AAS
  // GraphRegistry: AAS_TOTAL, AAS_ONCPU_SESSIONS, CORE_BASELINE_SESSIONS

  if (graph.id === 2) {
    return renderLine(
      graph,
      {
        keys: ["aas_total", "aas_oncpu_sessions", "core_baseline_sessions"],
        legends: ["AAS Total", "AAS On-CPU Sessions", "Core Baseline Sessions"],
      },
      mode
    );
  }

  if (graph.id === 10) {
    return renderStack(
      graph,
      ["SYSTEM", "SYSAUX", "USERS", "UNDO", "TEMP"],
      [
        "system_ts_usage_pct",
        "sysaux_ts_usage_pct",
        "users_ts_usage_pct",
        "undo_ts_usage_pct",
        "temp_ts_usage_pct",
      ]
    );
  }

  // === CPU 카테고리 (그래프 ID 기반 매칭) ===
  // Graph ID 13: CPU 활동 현황 타일
  // GraphRegistry: HOST_BUSY_CORES, HOST_TOTAL_CORES, HOST_CPU_UTIL_PCT, AAS_ONCPU_SESSIONS, CORE_BASELINE_SESSIONS,
  //                CPU_SATURATION_PCT, DB_OF_HOST_SHARE_PCT, RunQ_per_Core_LOAD_PROXY, TPS_PER_SEC, EXECS_PER_SEC

  if (graph.id === 13) {
    return renderMetricTiles(
      graph,
      [
        {
          key: "host_cpu_util_pct",
          label: "호스트 CPU 사용률",
          suffix: " %",
          decimals: 2,
          subtitleSuffix: " cores",
          subtitleKeys: ["host_busy_cores", "host_total_cores"],
        },
        {
          key: "cpu_saturation_pct",
          label: "DB CPU 포화도",
          subtitle: "(DB CPU 작업량 / DB 할당 CPU)",
          suffix: " %",
          decimals: 2,
        },
        {
          key: "db_of_host_share_pct",
          label: "DB CPU 점유율",
          subtitle: "(DB CPU 작업량 / Host CPU 사용량)",
          suffix: " %",
          decimals: 2,
        },
        {
          key: "runq_per_core_load_proxy",
          label: "RunQ",
          subtitle: "(코어 당 대기 작업 수)",
          suffix: " /Core",
          decimals: 2,
        },
        { key: "tps_per_sec", label: "TPS", suffix: " /s", decimals: 2 },
        { key: "execs_per_sec", label: "EXEC/S", suffix: " /s", decimals: 2 },
      ],
      6
    );
  }

  // Graph ID 19: Foreground vs Background CPU 추이
  if (graph.id === 19) {
    return renderLine(
      graph,
      {
        keys: ["aas_fg_sessions", "aas_bg_sessions"],
        legends: ["Foreground AAS", "Background AAS"],
      },
      mode
    );
  }

  // Graph ID 15: Host CPU Utilization
  if (graph.id === 15) {
    return renderLine(
      graph,
      {
        keys: ["host_cpu_util_pct"],
        legends: ["Host CPU Util (%)"],
      },
      mode
    );
  }

  // Graph ID 14: DB CPU Saturation - AAS vs Core
  // GraphRegistry: AAS_ONCPU_SESSIONS, CORE_BASELINE_SESSIONS

  if (graph.id === 14) {
    return renderLine(
      graph,
      {
        keys: ["aas_oncpu_sessions" /*"core_baseline_sessions"*/],
        legends: ["AAS On-CPU" /*"Core Baseline Sessions"*/],
      },
      mode
    );
  }

  // Graph ID 16: DB CPU Share of Host
  // GraphRegistry: DB_OF_HOST_SHARE_PCT, OTHER_PROCESSES_PCT

  if (graph.id === 16) {
    return renderLine(
      graph,
      {
        keys: ["db_of_host_share_pct", "other_processes_pct"],
        legends: ["DB CPU Share (%)", "Other Processes (%)"],
      },
      mode
    );
  }

  // Graph ID 18: CPU Cost per Commit/Execution
  if (graph.id === 18) {
    return renderLine(
      graph,
      {
        keys: ["cpu_per_commit_ms", "cpu_per_exec_ms"],
        legends: ["CPU per Commit (ms)", "CPU per Exec (ms)"],
      },
      mode
    );
  }

  // Graph ID 17: Run Queue per Core - Scheduler Load
  // GraphRegistry: RunQ_per_Core_LOAD_PROXY, Load_threshold, load_threshold_min, load_threshold_max

  if (graph.id === 17) {
    return renderLine(
      graph,
      {
        keys: [
          "runq_per_core_load_proxy",
          //"load_threshold",
          //"load_threshold_min",
          //"load_threshold_max",
        ],
        legends: [
          "Run Queue per Core",
          // "Load Threshold",
          // "Load Threshold Min",
          // "Load Threshold Max",
        ],
      },
      mode
    );
  }

  // === MEMORY 카테고리 ===
  if (graph.id === 21) {
    return renderMetricTiles(
      graph,
      [
        {
          key: "pga_used_bytes",
          label: "OS 메모리 사용률",
          suffix: " %",
          // divisor 제거: 특별 처리에서 이미 퍼센트로 계산함
          decimals: 2,
          subtitleKeys: ["os_memory_used_calc", "os_memory_total_calc"],
          subtitleDivisor: 1, // 이미 GB 단위로 계산된 값
          subtitleDecimals: 2,
          subtitleSuffix: " GB", // 두 번째 값에 GB 붙임
        },
        {
          key: "pga_used_bytes",
          label: "PGA 한도대비 사용률",
          suffix: "%",
          divisor: 21_474_836.48, // 2GB / 100 (퍼센트 계산: pga_used_bytes / 2GB * 100)
          decimals: 1,
          subtitleKeys: ["pga_used_bytes"],
          subtitleDivisor: 1_073_741_824, // GB 변환 (1GB = 2^30 bytes)
          subtitleDecimals: 1,
          subtitleSuffix: " / 2 GB",
        },

        {
          key: "pga_util_pct",
          label: "PGA 타겟대비 사용률",
          suffix: "%",
          subtitleKeys: ["pga_used_bytes", "pga_target_bytes"],
          subtitleDivisor: 1_048_576, // MB 변환
          subtitleDecimals: 1,
          subtitleSuffix: "MB",
        },
        { key: "memory_sort_pct", label: "Memory Sort", suffix: "%" },
        { key: "dedicated_sess_cnt", label: "Dedicated" },
        { key: "parallel_proc_cnt", label: "Parallel" },
        { key: "shared_server_proc_cnt", label: "Shared" },
        { key: "dispatcher_proc_cnt", label: "Dispatcher" },
        { key: "job_proc_cnt", label: "Job" },
      ],
      5 // columns: 5 (첫 줄 5개, 둘째 줄 4개로 2줄 표시)
    );
  }

  if (graph.id === 22) {
    return renderMetricTiles(
      graph,
      [
        {
          key: "sga_util_pct",
          label: "SGA 사용률",
          suffix: "%",
          decimals: 2,
          subtitleDivisor: 1_073_741_824,
          subtitleDecimals: 2,
          subtitleSuffix: "GB",
          subtitleKeys: ["sga_used_bytes", "sga_total_bytes"],
        },
        {
          key: "shared_pool_usage_pct_calc",
          label: "Shared Pool",
          suffix: "%",
          decimals: 2,
          subtitleKeys: ["shared_pool_usage_bytes_calc", "shared_pool_bytes"],
          subtitleDivisor: 1_048_576,
          subtitleDecimals: 2,
          subtitleSuffix: "MB",
        },
        {
          key: "library_cache_mb",
          label: "Libary Cache",
          suffix: " MB",
          decimals: 2,
        },

        {
          key: "dictionary_cache_mb",
          label: "Dictionary Cache",
          suffix: " MB",
          decimals: 2,
        },
        {
          key: "large_pool_mb",
          label: "Large Pool",
          suffix: " MB",
          decimals: 2,
        },
        { key: "java_pool_mb", label: "Java Pool", suffix: " MB", decimals: 2 },
        {
          key: "log_buffer_mb",
          label: "Log Buffer",
          suffix: " MB",
          decimals: 2,
        },
        {
          key: "buffer_cache_mb",
          label: "Buffer Cache",
          suffix: " MB",
          decimals: 2,
        },
      ],
      4
    );
  }

  // Graph ID 23: PGA Utilization (%) – Trend
  // GraphRegistry: PGA_UTIL_PCT

  if (graph.id === 23) {
    return renderLine(
      graph,
      {
        keys: ["pga_util_pct"],
        legends: ["PGA Utilization (%)"],
      },
      mode
    );
  }

  // Graph ID 24: SGA Utilization (%) — Trend
  // GraphRegistry: SGA_UTIL_PCT

  if (graph.id === 24) {
    return renderLine(
      graph,
      {
        keys: ["sga_util_pct"],
        legends: ["SGA Utilization (%)"],
      },
      mode
    );
  }

  if (graph.id === 25) {
    return renderLine(
      graph,
      {
        keys: ["workarea_spill_rate_pct"],
        legends: ["Spill Rate (%)"],
      },
      mode
    );
  }

  if (graph.id === 26) {
    return renderLine(
      graph,
      {
        keys: ["library_cache_reloads_per_sec"],
        legends: ["Reloads/s"],
      },
      mode
    );
  }

  if (graph.id === 27) {
    // allGraphsInCategory에서 22번 그래프 찾기
    const graph22 = allGraphsInCategory?.find((g) => g.id === 22);

    if (graph22) {
      // 22번 그래프 데이터로 5개 캐시 히트율 지표를 타일로 표시
      return renderMetricTiles(
        graph22,
        [
          {
            key: "buffer_cache_hit_pct",
            label: "Buffer Cache Hit Ratio",
            truncateDecimals: 2,
            suffix: "%",
          },
          {
            key: "library_cache_hit_pct",
            label: "Library Cache Hit Ratio",
            truncateDecimals: 2,
            suffix: "%",
          },
          {
            key: "dictionary_cache_hit_pct",
            label: "Dictionary Cache Hit Ratio",
            truncateDecimals: 2,
            suffix: "%",
          },
          {
            key: "latch_hit_pct",
            label: "Latch Hit Ratio",
            truncateDecimals: 2,
            suffix: "%",
          },
          {
            key: "redo_buffer_wait_pct",
            label: "Redo Buffer Wait Ratio",
            truncateDecimals: 2,
            suffix: "%",
          },
        ],
        5 // columns: 5 (1행 5열)
      );
    }

    // 22번 그래프가 없으면 기존 renderLine 코드 실행 (기존 동작 유지)
    return renderLine(
      graph,
      {
        keys: ["buffer_miss_pct"],
        legends: ["Miss Rate (%)"],
      },
      mode
    );
  }

  // === SESSION 카테고리 ===

  if (graph.id === 29) {
    return renderLine(
      graph,
      {
        keys: ["active_user_sessions_now", "inactive_user_sessions_now"],
        legends: ["Active", "Inactive"],
      },
      mode
    );
  }

  if (graph.id === 30) {
    return renderLine(
      graph,
      {
        keys: ["aas_oncpu_sessions", "aas_wait_sessions"],
        legends: ["On-CPU", "Wait"],
      },
      mode
    );
  }

  if (graph.id === 31) {
    return renderLine(
      graph,
      {
        keys: ["lock_wait_tx", "lock_wait_tm", "lock_wait_total"],
        legends: ["TX", "TM", "Total"],
      },
      mode
    );
  }

  if (graph.id === 32) {
    return renderLine(
      graph,
      {
        keys: ["tps_per_sec"],
        legends: ["TPS"],
      },
      mode
    );
  }

  if (graph.id === 33) {
    return renderLine(
      graph,
      {
        keys: ["execs_per_sec"],
        legends: ["Exec/s"],
      },
      mode
    );
  }

  if (graph.id === 34) {
    return renderLine(
      graph,
      {
        keys: ["logons_per_sec", "disconnects_per_sec"],
        legends: ["Logons/s", "Disconnects/s"],
      },
      mode
    );
  }

  if (graph.id === 35) {
    return renderMetricTiles(
      graph,
      [
        {
          key: "active_user_sessions_now",
          label: "활성 사용자 세션",
          subtitleSuffix: "Total",
          subtitleFirstSuffix: "Active",
          subtitleKeys: ["active_user_sessions_now", "total_user_sessions_now"],
        },
        {
          key: "sessions_limit_util_pct",
          label: "전체 세션 사용률",

          suffix: "%",
          subtitleSuffix: "Sessions",
          subtitleKeys: ["sessions_used_current", "sessions_limit"], // 추가
        },
        {
          key: "processes_limit_util_pct",
          label: "프로세스 사용률",
          suffix: "%",
          subtitleSuffix: "Process",
          subtitleKeys: ["processes_current", "processes_limit"], // 추가
        },
        { key: "blockers_now", label: "Blockers" },
        { key: "blocked_now", label: "Blocked" },
      ],
      5 // columns: 5 (한 줄에 5개 모두 표시)
    );
  }

  // === I/O 카테고리 ===
  // Graph ID 37: I/O Performance Dashboard
  // GraphRegistry: cache_hit_ratio_pct, avg_io_wait_time_ms, physical_reads_per_sec, redo_size_mb_per_sec, parse_execute_ratio, direct_path_io_per_sec
  if (graph.id === 37) {
    return renderMetricTiles(
      graph,
      [
        {
          key: "cache_hit_ratio_pct",
          label: "Buffer Cache Hit Ratio",
          suffix: " %",
          decimals: 2,
        },
        {
          key: "avg_io_wait_time_ms",
          label: "평균 I/O 대기",
          suffix: " ms",
          decimals: 2,
        },
        {
          key: "physical_reads_per_sec",
          label: "Physical Reads",
          subtitle: "blocks/s",
          decimals: 2,
        },

        {
          key: "redo_size_mb_per_sec",
          label: "Redo 생성량",
          suffix: " MB/s",
          decimals: 2,
        },
        {
          key: "parse_execute_ratio",
          label: "파스/실행 비율",
          suffix: " %",
          decimals: 2,
        },
        {
          key: "direct_path_io_per_sec",
          label: "Direct Path I/O",
          subtitle: "blocks/s",
        },
      ],
      6
    );
  }

  // Graph ID 38: Direct Path I/O (개/초)
  // GraphRegistry: physical_reads_direct_per_sec, physical_writes_direct_per_sec, direct_io_ratio_pct

  if (graph.id === 38) {
    return renderLine(
      graph,
      {
        keys: [
          "physical_reads_direct_per_sec",
          "physical_writes_direct_per_sec",
          // "direct_io_ratio_pct",
        ],
        legends: [
          "Physical Reads Direct (/s)",
          "Physical Writes Direct (/s)",
          // "Direct I/O Ratio (%)",
        ],
      },
      mode
    );
  }

  // Graph ID 39: SQL Parsing & Execution (개/초)
  // GraphRegistry: parser_request_per_sec, sql_execute_per_sec, sql_parse_execute_ratio

  if (graph.id === 39) {
    return renderLine(
      graph,
      {
        keys: [
          // "parser_request_per_sec",
          // "sql_execute_per_sec",
          "sql_parse_execute_ratio",
        ],
        legends: [
          // "Parser Request (/s)",
          // "SQL Execute (/s)",
          "Parse/Execute Ratio",
        ],
      },
      mode
    );
  }

  // Graph ID 40: Physical Reads vs Logical Reads (개/초)
  // GraphRegistry: physical_reads_per_diff_sec, logical_reads_per_sec, cache_hit_ratio_diff_pct, total_reads_per_sec

  if (graph.id === 40) {
    return renderLine(
      graph,
      {
        keys: [
          "physical_reads_per_diff_sec",
          "logical_reads_per_sec",
          // "cache_hit_ratio_diff_pct",
          // "total_reads_per_sec",
        ],
        legends: [
          "Physical Reads (/s)",
          "Logical Reads (/s)",
          // "Cache Hit Ratio Diff (%)",
          // "Total Reads (/s)",
        ],
      },
      mode
    );
  }

  // Graph ID 41: Average I/O Wait Time (ms)
  // GraphRegistry: avg_wait_time_ms, io_waits_per_sec, io_time_per_sec_ms
  if (graph.id === 41) {
    return renderLine(
      graph,
      {
        keys: ["avg_wait_time_ms" /*"io_waits_per_sec", "io_time_per_sec_ms"*/],
        legends: [
          "Avg Wait Time (ms)" /*"I/O Waits (/s)", "I/O Time (/s ms)"*/,
        ],
      },
      mode
    );
  }

  // Graph ID 42: Redo Generation Rate (MB/초)
  // GraphRegistry: redo_generation_mbps, redo_generation_mbps_total,log_switch_count_1min
  if (graph.id === 42) {
    return renderLine(
      graph,
      {
        keys: [
          "redo_generation_mbps",
          // "redo_generation_mbps_total",
          // "log_switch_count_1min",
        ],
        legends: [
          "Redo Generation (MB/s)",
          // "Redo Total (MB/s)",
          // "Log Switch 1min",
        ],
      },
      mode
    );
  }

  //   // Graph ID 42: Redo Generation Rate (MB/초)
  // // GraphRegistry: redo_generation_mbps, redo_generation_mbps_total,  log_switch_count_1min
  // if (graph.id === 43 ) {
  //   return renderLine(graph, {
  //     keys: ["redo_generation_mbps", "redo_generation_mbps_total", "log_switch_count_1min"],
  //     legends: ["Redo Generation (MB/s)", "Redo Total (MB/s)",  "Log Switch 1min"],
  //   }, mode);
  // }

  // === STORAGE 카테고리 ===
  // Graph ID 45: Storage Health Dashboard
  // GraphRegistry: FRA_USAGE_PERCENT, FRA_FREE_GB, UNDO_USAGE_PCT, TEMP_USAGE_PCT, MAX_TS_NAME, MAX_TS_USAGE_PCT, TOTAL_DB_USAGE_PCT

  if (graph.id === 45) {
    return renderMetricTiles(
      graph,
      [
        {
          key: "fra_usage_percent",
          label: "FRA 사용률",
          suffix: "%",
          decimals: 2,
          subtitleKeys: [""],
        },
        { key: "fra_free_gb", label: "FRA 여유", suffix: " GB", decimals: 2 },
        {
          key: "undo_usage_pct",
          label: "Undo 사용률",
          suffix: "%",
          decimals: 2,
        },
        {
          key: "temp_usage_pct",
          label: "Temp 사용률",
          suffix: "%",
          decimals: 2,
        },
        // {
        //   key: "max_ts_name",
        //   label: "최대 사용 테이블 스페이스",
        // },

        {
          key: "max_ts_usage_pct",
          label: "최대 테이블 스페이스 사용률",
          suffix: "%",
          decimals: 2,
          subtitleKeys: ["max_ts_name"],
        },
        {
          key: "total_db_usage_pct",
          label: "전체 DB 사용률 ",
          suffix: "%",
          decimals: 2,
        },
      ],
      7
    );
  }

  // Graph ID 46: Temp Tablespace Active Usage (GB)
  // GraphRegistry: temp_active_usage_gb, temp_current_size_gb, temp_max_size_gb, temp_usage_percent, temp_usage_pct_of_max, temp_peak_usage_24h_gb

  if (graph.id === 46) {
    return renderLine(
      graph,
      {
        keys: [
          // "temp_active_usage_gb",
          // "temp_current_size_gb",
          // "temp_max_size_gb",
          "temp_usage_percent",
          // "temp_usage_pct_of_max",
          // "temp_peak_usage_24h_gb",
        ],
        legends: [
          // "Active Usage (GB)",
          // "Current Size (GB)",
          // "Max Size (GB)",
          "Usage (%)",
          // "Usage of Max (%)",
          // "Peak 24h (GB)",
        ],
      },
      mode
    );
  }

  // Graph ID 47: 테이블스페이스 사용률 추세 (%)
  // GraphRegistry: system_tablespace_name, sysaux_tablespace_name, undotbs1_tablespace_name, users_tablespace_name,
  //                system_used_percent, sysaux_used_percent, undotbs1_used_percent, users_used_percent
  if (graph.id === 47) {
    return renderLine(
      graph,
      {
        keys: [
          "system_used_percent",
          "sysaux_used_percent",
          "undotbs1_used_percent",
          "users_used_percent",
        ],
        legends: ["SYSTEM", "SYSAUX", "UNDOTBS1", "USERS"],
      },
      mode
    );
  }

  // Graph ID 48: 테이블스페이스 증가 추세 (GB/일)
  // GraphRegistry: system_tablespace_name_inc, sysaux_tablespace_name_inc, undotbs1_tablespace_name_inc, users_tablespace_name_inc,
  //                system_used_space_gb_inc, sysaux_used_space_gb_inc, undotbs1_used_space_gb_inc, users_used_space_gb_inc

  if (graph.id === 48) {
    const sorted = sortPoints(graph);
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];
    const availableKeys = Object.keys(latest.values ?? {});

    // labels를 가져올 키들 찾기 (endsWith 사용)
    const labelKeys = availableKeys
      .filter((k) => k.toLowerCase().endsWith("_tablespace_name_inc"))
      .sort();
    // const labels = labelKeys.map((k) => String(latest.values?.[k] ?? ""));

    // values를 가져올 키들 찾기 (endsWith 사용)
    const valueKeys = availableKeys
      .filter((k) => k.toLowerCase().endsWith("_used_space_gb_inc"))
      .sort();

    // labelKeys와 valueKeys를 매칭하여 함께 정렬
    const pairs = labelKeys
      .map((labelKey) => {
        // 같은 숫자 접두사를 가진 valueKey 찾기
        const labelPrefix = labelKey.match(/^(.+)_tablespace_name_inc$/)?.[1];
        const valueKey = valueKeys.find(
          (vk) =>
            vk.toLowerCase() ===
            `${labelPrefix}_used_space_gb_inc`.toLowerCase()
        );
        return {
          labelKey,
          valueKey: valueKey || "",
          value: ensureNumber(latest.values?.[valueKey || ""]) ?? 0,
          label: String(latest.values?.[labelKey] ?? ""),
        };
      })
      .filter((pair) => pair.valueKey); // valueKey가 있는 것만 필터링

    // 값 기준으로 내림차순 정렬 (높은 값이 위로)
    pairs.sort((a, b) => b.value - a.value);

    // 정렬 후 labels와 valueKeys 분리
    const sortedLabels = pairs.map((pair) => pair.label);
    const sortedValueKeys = pairs.map((pair) => pair.valueKey);

    // tooltipFormatter 생성
    const tooltipFormatter = ({
      used,
    }: {
      used: number;
      total: number;
      percent: number;
    }) => {
      // 소수점 둘째자리까지 반올림하고 " %" 붙이기
      return `${used.toFixed(2)} GB`;
    };

    return renderStack(graph, sortedLabels, sortedValueKeys, tooltipFormatter);
  }

  // Graph ID 49: FRA 사용률 추세 (%)
  // GraphRegistry: space_limit_gb, space_used_gb, space_reclaimable_gb, usage_pct, hourly_growth_pct, time_to_95_pct_hours

  if (graph.id === 49) {
    return renderLine(
      graph,
      {
        keys: [
          // "space_limit_gb",
          // "space_used_gb",
          // "space_reclaimable_gb",
          "usage_pct",
          // "hourly_growth_pct",
          // "time_to_95_pct_hours",
        ],
        legends: [
          // "Space Limit (GB)",
          // "Space Used (GB)",
          // "Space Reclaimable (GB)",
          "Usage (%)",
          // "Hourly Growth (%)",
          // "Time to 95% (hours)",
        ],
      },
      mode
    );
  }

  // Graph ID 50: Undo 사용률 추세 (%)
  // GraphRegistry: undo_tablespace_name, undo_usage_percent, long_transaction_count, long_transaction_undo_mb, undo_retention_sec

  if (graph.id === 50) {
    return renderLine(
      graph,
      {
        keys: [
          // "undo_tablespace_name",
          "undo_usage_percent",
          // "long_transaction_count",
          // "long_transaction_undo_mb",
          // "undo_retention_sec",
        ],
        legends: [
          // "Undo TS Name",
          "Undo Usage (%)",
          // "Long Transaction Count",
          // "Long Transaction Undo (MB)",
          // "Undo Retention (sec)",
        ],
      },
      mode
    );
  }

  // Graph ID 51: Total Database Usage Trend (%)
  // GraphRegistry: total_db_usage_percent

  if (graph.id === 51) {
    return renderLine(
      graph,
      {
        keys: ["total_db_usage_percent"],
        legends: ["Total Usage (%)"],
      },
      mode
    );
  }

  if (graph.id === 20) {
    const sorted = sortPoints(graph);
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];
    const availableKeys = Object.keys(latest.values ?? {});

    // SQL_ID 키들 찾기 (값을 labels로 사용)
    const sqlIdKeys = availableKeys
      .filter((k) => k.toLowerCase().startsWith("top_sql_by_cpu_sql_id_"))
      .sort();
    const labels = sqlIdKeys.map((k) => String(latest.values?.[k] ?? ""));

    // VALUE 키들 찾기 (keys로 사용)
    const valueKeys = availableKeys
      .filter((k) => k.toLowerCase().startsWith("top_sql_by_cpu_value_"))
      .sort();

    // tooltipFormatter 생성
    const tooltipFormatter = (
      { used }: { used: number; total: number; percent: number },
      _index: number // eslint-disable-line @typescript-eslint/no-unused-vars
    ) => {
      // 소수점 둘째자리까지 반올림하고 " ms" 붙이기
      return `${used.toFixed(2)} ms`;
    };

    return renderStack(graph, labels, valueKeys, tooltipFormatter);
  }

  if (graph.id === 28) {
    const sorted = sortPoints(graph);
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];
    const availableKeys = Object.keys(latest.values ?? {});

    // SQL_ID 키들 찾기 (값을 labels로 사용)
    const sqlIdKeys = availableKeys
      .filter((k) =>
        k.toLowerCase().startsWith("top_sql_by_shared_pool_sql_id_")
      )
      .sort();
    const labels = sqlIdKeys.map((k) => String(latest.values?.[k] ?? ""));

    // VALUE 키들 찾기 (keys로 사용)
    const valueKeys = availableKeys
      .filter((k) =>
        k.toLowerCase().startsWith("top_sql_by_shared_pool_value_")
      )
      .sort();

    // tooltipFormatter 생성
    const tooltipFormatter = ({
      used,
    }: {
      used: number;
      total: number;
      percent: number;
    }) => {
      // 1,048,576으로 나누고 소수점 둘째자리까지 반올림
      const mbValue = used / 1_048_576;
      return `${mbValue.toFixed(3)} MB`;
    };

    // x축 라벨 포맷터 생성 (툴팁과 동일한 변환 적용)
    const xAxisFormatter = (value: number) => {
      const mbValue = value / 1_048_576;
      return `${mbValue.toFixed(3)}`;
    };

    return renderStack(
      graph,
      labels,
      valueKeys,
      tooltipFormatter,
      xAxisFormatter
    );
  }

  if (graph.id === 36) {
    const sorted = sortPoints(graph);
    // if (sorted.length === 0) return null;
    if (sorted.length === 0) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
          }}
        >
          현재 블락당한 세션이 없습니다.
        </div>
      );
    }
    const latest = sorted[sorted.length - 1];
    const availableKeys = Object.keys(latest.values ?? {});

    // SQL_ID 키들 찾기 (값을 labels로 사용)
    const sqlIdKeys = availableKeys
      .filter(
        (k) => k.toLowerCase().startsWith("top_blocker_session_sid_") // TOP_BLOCKER_SESSION_SID_05, TOP_BLOCKER_SESSION_VICTIMS_01
      )
      .sort();
    const labels = sqlIdKeys.map((k) => String(latest.values?.[k] ?? ""));

    // labels가 모두 빈 문자열이거나 0.0인지 체크
    if (
      labels.every((label) => {
        const trimmed = label.trim();
        return trimmed === "" || parseFloat(trimmed) === 0;
      })
    ) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
          }}
        >
          현재 블락당한 세션이 없습니다.
        </div>
      );
    }

    // VALUE 키들 찾기 (keys로 사용)
    const valueKeys = availableKeys
      .filter((k) => k.toLowerCase().startsWith("top_blocker_session_victims_"))
      .sort();

    return renderStack(graph, labels, valueKeys);
  }

  if (graph.id === 44) {
    const sorted = sortPoints(graph);
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];
    const availableKeys = Object.keys(latest.values ?? {});

    // labels를 가져올 키들 찾기 (endsWith 사용)
    const labelKeys = availableKeys
      .filter((k) => k.toLowerCase().endsWith("_data_tablespace_name"))
      .sort();
    const labels = labelKeys.map((k) => String(latest.values?.[k] ?? ""));

    // values를 가져올 키들 찾기 (endsWith 사용)
    const valueKeys = availableKeys
      .filter((k) => k.toLowerCase().endsWith("_data_io_share_pct"))
      .sort();

    // tooltipFormatter 생성
    const tooltipFormatter = (
      { used }: { used: number; total: number; percent: number },
      index: number
    ) => {
      // 해당 index의 labelKey에서 숫자 추출 (예: "1_data_tablespace_name" -> "1")
      const labelKey = labelKeys[index];
      if (!labelKey) return "";

      // 숫자 부분 추출 (키의 시작 부분에서 숫자만)
      const match = labelKey.match(/^(\d+)_/);
      if (!match) return "";

      const numberPrefix = match[1];

      // 같은 숫자로 시작하는 file_name 키 찾기
      const fileNameKey = availableKeys.find(
        (k) =>
          k.toLowerCase() === `${numberPrefix}_data_file_name`.toLowerCase()
      );

      // io_share_pct 값 (used가 이미 해당 값)
      const ioSharePct = used;

      // file_name 값 가져오기
      const fileName = fileNameKey
        ? String(latest.values?.[fileNameKey] ?? "")
        : "";

      // 파일 경로에서 파일명만 추출 (마지막 '/' 이후 부분)
      const fileNameOnly = fileName
        ? fileName.split("/").pop() || fileName
        : "";

      // 포맷팅: (35.3 %) , 파일 이름 : undotbs01.dbf
      return `(${ioSharePct.toFixed(1)} %) , 파일 이름 : ${fileNameOnly}`;
    };

    return renderStack(graph, labels, valueKeys, tooltipFormatter);
  }
  // 5_tablespace_name_seg,1_size_gb_seg
  if (graph.id === 52) {
    // 기존 코드 주석처리
    /*
    const sorted = sortPoints(graph);
    if (sorted.length === 0) return null;
    const latest = sorted[sorted.length - 1];
    const availableKeys = Object.keys(latest.values ?? {});

    // labels를 가져올 키들 찾기 (endsWith 사용)
    const labelKeys = availableKeys
      .filter((k) => k.toLowerCase().endsWith("_tablespace_name_seg"))
      .sort();
    const labels = labelKeys.map((k) => String(latest.values?.[k] ?? ""));

    // values를 가져올 키들 찾기 (endsWith 사용)
    const valueKeys = availableKeys
      .filter((k) => k.toLowerCase().endsWith("_size_gb_seg"))
      .sort();

    return renderStack(graph, labels, valueKeys);
    */

    // 하드코딩 데이터
    const labels = [
      "SYS.IDL_UB1$",
      "SYS.SYS_LOB0000000191C00010$$",
      "SYS.PDB_SYNC$",
      "MDSYS.SYS_LOB0000067546C00006$$",
      "MDSYS.SYS_LOB0000067646C00006$$",
    ];

    const usage = [376, 340, 80, 56.3125, 56.3125];

    const tooltipTexts = [
      "TABLE · SYSTEM Tablespace",
      "LOBSEGMENT · SYSTEM Tablespace",
      "TABLE · SYSTEM Tablespace",
      "LOBSEGMENT · SYSAUX Tablespace",
      "LOBSEGMENT · SYSAUX Tablespace",
    ];

    const tooltipFormatter = (
      { used }: { used: number; total: number; percent: number },
      index: number
    ) => {
      return `${tooltipTexts[index]} · ${used.toFixed(2)} MB`;
    };
    // 머지안전
    // renderStack을 직접 호출하는 대신 StackChart를 직접 렌더링
    // useActualValue를 true로 설정하여 실제 MB 값 표시 --
    return (
      <StackChart
        labels={labels}
        usage={usage}
        total={usage} // total은 usage와 동일하게 설정 (실제 값 모드)
        useActualValue={true}
        tooltipFormatter={tooltipFormatter}
        xMin={0}
        xMax={Math.max(...usage) * 1.2} // 최대값의 120%
        colorRules={[
          { min: 0, max: 69, color: "#22C55E" },
          { min: 70, max: 84, color: "#FACC15" },
          { min: 85, max: 100, color: "#EF4444" },
        ]}
        height="100%" // 카드 높이에 맞게 동적 조정
      />
    );
  }

  // Graph ID 43: DBWR Checkpoint Activity
  if (graph.id === 43) {
    const sorted = sortPoints(graph);
    if (sorted.length === 0) return null;

    const availableKeys = Object.keys(sorted[0].values ?? {});

    // dbwr_write_count_per_min을 찾기
    const dbwrKey = availableKeys.find((k) =>
      k.toLowerCase().includes("dbwr_write_count_per_min")
    );

    // 두 번째 키 찾기 (필요한 지표에 따라 변경)
    const secondKey =
      availableKeys.find(
        (k) =>
          k !== dbwrKey &&
          k.toLowerCase().includes("dbwr_write_volume_mb_per_min") // 예시
      ) || availableKeys[1]; // 없으면 두 번째 키 사용

    if (!dbwrKey || !secondKey) {
      return mainChartRenderer(title, graph, mode); // 키를 찾지 못하면 기본 처리
    }

    const categories = sorted.map((point) => formatTime(point.timestamp, mode));
    const columnData = sorted.map(
      (point) => ensureNumber(point.values?.[dbwrKey]) ?? 0
    );
    const lineData = sorted.map((point) => {
      const value = ensureNumber(point.values?.[secondKey]) ?? 0;
      return parseFloat(value.toFixed(2)); // 소수점 2자리까지 반올림
    });

    return (
      <MixedChart
        categories={categories}
        columnData={columnData}
        lineData={lineData}
        yaxisLeftTitle="DBWR Write Count (/min)"
        yaxisRightTitle={secondKey}
      />
    );
  }

  // 위의 조건들에 매칭되지 않으면 타입 기반으로 렌더링 시도
  if (graph.type != null) {
    const rendered = mainChartRenderer(title, graph, mode);
    // mainChartRenderer가 null을 반환하지 않도록 보장
    if (rendered) {
      return rendered;
    }
  }

  // 모든 조건에 매칭되지 않으면 빈 차트 표시
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
      }}
    >
      데이터를 불러오는 중입니다...
    </div>
  );
};
