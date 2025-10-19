import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.scss";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src="/vite.svg" alt="logo" />
        <span>CCDB</span>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/" className="sidebar__item">
          Dashboard
        </NavLink>
        <NavLink to="/users" className="sidebar__item">
          Users
        </NavLink>
        <NavLink to="/settings" className="sidebar__item">
          Settings
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
