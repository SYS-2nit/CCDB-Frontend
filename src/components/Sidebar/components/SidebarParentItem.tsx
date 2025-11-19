import React from "react";
import BottomArrow from "@/assets/general/bottom-arrow.svg";
import TopArrow from "@/assets/general/clicked-top-arrow.svg";

interface Props {
  icon: string;
  label: string;
  menuKey: string;
  openMenu: string | null;
  toggleMenu: (menu: string) => void;
  isCollapsed: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onParentClick?: () => void;
  children?: React.ReactNode;
}

const SidebarParentItem: React.FC<Props> = ({
  icon,
  label,
  menuKey,
  openMenu,
  toggleMenu,
  isCollapsed,
  onClick,
  onParentClick,
  children,
}) => {
  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onParentClick) onParentClick();
  };

  return (
    <div className="sidebar__item--parent--arrow">
      <div
        className={`sidebar__item--parent--left ${
          openMenu === menuKey ? "active" : ""
        }`}
        onClick={onClick}
      >
        <div className="sidebar__item--parent--arrow-left">
          <img src={icon} alt={label} />
          {!isCollapsed && (
            <span className="sidebar__item--title" onClick={handleLabelClick}>
              {label}
            </span>
          )}
        </div>

        {!isCollapsed && (
          <span
            className="arrow"
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu(menuKey);
            }}
          >
            {openMenu === menuKey ? (
              <img src={TopArrow} alt="up" />
            ) : (
              <img src={BottomArrow} alt="down" />
            )}
          </span>
        )}
      </div>

      {!isCollapsed && openMenu === menuKey && children}
    </div>
  );
};

export default SidebarParentItem;
