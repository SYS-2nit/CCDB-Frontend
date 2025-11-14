import React from "react";
import "./List.scss";

interface DatabaseItemProps {
  name: string;
  updatedAt?: string;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onClick: () => void;
}

const formatUpdatedAt = (value?: string) => {
  if (!value) {
    return "최종 업데이트: -";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "최종 업데이트: -";
  }

  const pad = (num: number) => String(num).padStart(2, "0");

  const formatted = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;

  return `최종 업데이트: ${formatted}`;
};

const Item: React.FC<DatabaseItemProps> = ({
  name,
  updatedAt,
  selected,
  onSelect,
  onClick,
}) => {
  return (
    <div
      className={`db-item ${selected ? "db-item--selected" : ""}`}
      onClick={onClick}
    >
      <label className="db-item-checkbox" onClick={(event) => event.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelect(event.target.checked)}
        />
      </label>
      <div className="db-item-content-wrapper">
        <div className="db-item-title">{name}</div>
        <div className="db-item-content">
          <div className="db-item-right-date">{formatUpdatedAt(updatedAt)}</div>
        </div>
      </div>
    </div>
  );
};

export default Item;
