const UNITS = ["", "K", "M", "G", "T", "P"];

interface FormattedNumber {
  value: number;
  unit: string;
}

const scaleToUnit = (value: number): FormattedNumber => {
  if (!Number.isFinite(value) || value === 0) {
    return { value: 0, unit: "" };
  }

  let scaled = value;
  let unitIndex = 0;

  if (Math.abs(scaled) < 1) {
    while (Math.abs(scaled) < 1 && unitIndex < UNITS.length - 1) {
      scaled *= 1000;
      unitIndex += 1;
    }
  } else {
    while (Math.abs(scaled) >= 1000 && unitIndex < UNITS.length - 1) {
      scaled /= 1000;
      unitIndex += 1;
    }
  }

  return { value: scaled, unit: UNITS[unitIndex] };
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




