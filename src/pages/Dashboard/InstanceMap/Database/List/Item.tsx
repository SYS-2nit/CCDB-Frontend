import React from "react";
import "./List.scss";

interface DatabaseItemProps {
  name: string;
  onClick: () => void;
}

const Item: React.FC<DatabaseItemProps> = ({ name, onClick }) => {
  return (
    <div className="db-item" onClick={onClick}>
      <div className="db-item-title">{name}</div>
      <div className="db-item-content">
        <div className="db-item-right-date">
          최종 업데이트: YYYY-MM-DD HH:MM:SS
        </div>
      </div>
    </div>
  );
};

export default Item;
