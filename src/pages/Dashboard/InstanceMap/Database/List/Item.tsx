import React from "react";
import "./List.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface DatabaseItemProps {
  name: string;
  updatedAt?: string;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
}

const Item: React.FC<DatabaseItemProps> = ({
  name,
  selected,
  onSelect,
  onClick,
}) => {
  return (
    <div
      className={`db-item ${selected ? "db-item--selected" : ""}`}
      onClick={onClick}
    >
      <label
        className="db-item-checkbox"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelect(event.target.checked)}
        />
      </label>
      <div className="db-item-content-wrapper">
        <div className="db-item-title">{name}</div>
      </div>
    </div>
  );
};

export default Item;
