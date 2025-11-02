import React from "react";
import "./List.scss";

interface DatabaseItemProps {
  name: string;
  date: string;
  onClick: () => void;
}

const Item: React.FC<DatabaseItemProps> = ({ name, date, onClick }) => {
  return (
    <div className="db-item" onClick={onClick}>
      <div className="db-item-title">{name}</div>
      <div className="db-item-content">
        <div className="db-item-right-date">{date}</div>
      </div>
    </div>
  );
};

export default Item;
