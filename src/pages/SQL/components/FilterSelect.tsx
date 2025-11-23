import React from "react";
import Select from "@/components/Select/Select";
import type { SqlFilterType } from "../types";
import type { FilterOption } from "../constants";

interface FilterSelectProps {
  value: SqlFilterType | "";
  onChange: (value: SqlFilterType) => void;
  options: FilterOption[];
  label?: string;
  placeholder?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  label = "필터",
  placeholder = "선택하세요.",
}) => {
  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value as SqlFilterType)}
      options={options}
    />
  );
};

