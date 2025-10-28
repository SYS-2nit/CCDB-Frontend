import React from "react";
import FilterIcon from "@/assets/general/filter.svg";

interface FilterButtonProps {
  onClick?: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ onClick }) => {
  return (
    <button className="filter-btn" onClick={onClick}>
      <img src={FilterIcon} alt="Filter Icon" />
      필터
    </button>
  );
};

export default FilterButton;
