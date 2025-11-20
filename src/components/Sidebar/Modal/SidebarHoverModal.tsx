import React from "react";

interface Props {
  pos: { x: number; y: number };
  items: string[];
  onEnter: () => void;
  onLeave: () => void;
  onSelect: (index: number) => void; // ⭐ 클릭 시 이동 이벤트 전달
}

const SidebarHoverModal: React.FC<Props> = ({
  pos,
  items = [],
  onEnter,
  onLeave,
  onSelect,
}) => {
  return (
    <div
      className="sidebar-hover-modal"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
      }}
    >
      {items.map((item, i) => (
        <div key={i} className="sidebar-hover-item" onClick={() => onSelect(i)}>
          {item}
        </div>
      ))}
    </div>
  );
};

export default SidebarHoverModal;
