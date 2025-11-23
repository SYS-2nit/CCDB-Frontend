/**
 * 마이크로초를 밀리초로 변환하고 포맷팅
 */
export const formatMicrosecondsToMs = (microseconds: number): string => {
  return `${(microseconds / 1000).toFixed(1)} ms`;
};

/**
 * 숫자를 포맷팅 (천 단위 구분자 추가)
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

