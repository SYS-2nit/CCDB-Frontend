import { NavLink } from "react-router-dom";

interface Props {
  to: string;
  icon: string;
  label: string;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<Props> = ({ to, icon, label, isCollapsed }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar__item ${isActive ? "active" : ""}`}
    >
      <img src={icon} alt={label} />
      {!isCollapsed && <span className="sidebar__item--title">{label}</span>}
    </NavLink>
  );
};

export default SidebarItem;
