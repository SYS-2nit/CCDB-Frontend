/**
 * 마이크로초(us) 값을 적절한 시간 단위로 변환하여 표시
 * @param valueUs 마이크로초 값
 * @returns 변환된 값과 단위가 포함된 문자열 (예: "1.31 sec", "21.89 min")
 */
export const formatTime = (valueUs: number): string => {
  if (!Number.isFinite(valueUs) || valueUs === 0) {
    return "0 us";
  }

  const absValue = Math.abs(valueUs);
  
  // 분 단위 (60초 = 1분)
  if (absValue >= 60_000_000) {
    const minutes = valueUs / 60_000_000;
    return minutes >= 100
      ? `${Math.round(minutes)} min`
      : `${Math.round(minutes * 100) / 100} min`;
  }
  
  // 초 단위 (1,000,000 us = 1초)
  if (absValue >= 1_000_000) {
    const seconds = valueUs / 1_000_000;
    return seconds >= 100
      ? `${Math.round(seconds)} sec`
      : `${Math.round(seconds * 100) / 100} sec`;
  }
  
  // 밀리초 단위 (1,000 us = 1 ms)
  if (absValue >= 1_000) {
    const milliseconds = valueUs / 1_000;
    return milliseconds >= 100
      ? `${Math.round(milliseconds)} ms`
      : `${Math.round(milliseconds * 100) / 100} ms`;
  }
  
  // 마이크로초 단위
  return `${Math.round(valueUs)} us`;
};

