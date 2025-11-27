/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

/**
 * 날짜를 MM-DD HH:MM 형식으로 포맷팅
 * 기간에 따라 자동으로 조정
 */
export const formatToMonthDayTime = (
  raw: string,
  startDate?: string,
  endDate?: string
): string => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");

  // 기간 계산 (일 단위)
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays >= 7) {
      // 일주일 이상: 일 시간 분 표시 (MM-DD HH:MM)
      return `${mm}-${dd} ${HH}:${MM}`;
    } else if (diffDays >= 2) {
      // 이틀 이상 ~ 일주일 미만: 일 시간 표시 (MM-DD HH:00)
      return `${mm}-${dd} ${HH}:00`;
    }
  }

  // 하루 이하: 분 단위까지 표시
  return `${mm}-${dd} ${HH}:${MM}`;
};

/**
 * 간단한 날짜 포맷팅 (기간 계산 없이)
 */
export const formatToMonthDayTimeSimple = (raw: string): string => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const MM = String(d.getMinutes()).padStart(2, "0");

  return `${mm}-${dd} ${HH}:${MM}`;
};
