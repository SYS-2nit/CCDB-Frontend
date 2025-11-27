/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface FormattedNumber {
  value: number;
  unit: string;
}

const scaleToUnit = (value: number): FormattedNumber => {
  if (!Number.isFinite(value) || value === 0) {
    return { value: 0, unit: "" };
  }

  // 원래 값 그대로 반환
  return { value: value, unit: "" };
};

export const formatNumberWithUnit = (value: number): string => {
  if (!Number.isFinite(value) || value === 0) {
    return "0";
  }

  const { value: scaled, unit } = scaleToUnit(value);
  const rounded = Math.round(scaled);
  return `${rounded}${unit}`;
};

export const formatTooltipNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "-";
  }

  const { value: scaled, unit } = scaleToUnit(value);
  const rounded =
    Math.abs(scaled) >= 100
      ? Math.round(scaled)
      : Math.round(scaled * 100) / 100;

  return `${rounded}${unit}`;
};
