import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.scss";
import logoTextIcon from "@/assets/sidebar/logo-text.svg";
import SidebarIcon from "@/assets/sidebar/sidebar.svg";
import DashboardIcon from "@/assets/sidebar/dashboard.svg";
import ClickedDashboardIcon from "@/assets/sidebar/clicked-dashboard.svg";
import SqlIcon from "@/assets/sidebar/sql.svg";
import AlertIcon from "@/assets/sidebar/alert.svg";
import AnalysisIcon from "@/assets/sidebar/analysis.svg";
import ClickedAnalysisIcon from "@/assets/sidebar/clicked-analysis.svg";
import ImprovementIcon from "@/assets/sidebar/improvement.svg";
import ClickedImprovementIcon from "@/assets/sidebar/clicked-improvement.svg";
import SettingIcon from "@/assets/sidebar/setting.svg";
import ClickedSettingIcon from "@/assets/sidebar/clicked-setting.svg";
import SupportIcon from "@/assets/sidebar/support.svg";

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar__logo">
        <img src={logoTextIcon} alt="logoTextIcon" />
        <img src={SidebarIcon} alt="sidebar" />
      </div>

      {/* Header와 Navigation 구분선 */}
      <div className="sidebar__divider" />

      {/* Navigation */}
      <nav className="sidebar__nav">
        {/* 대시보드 */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? "active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? ClickedDashboardIcon : DashboardIcon}
                alt="dashboard"
              />
              대시보드
            </>
          )}
        </NavLink>

        {/* SQL */}
        <div
          className="sidebar__item--parent"
          onClick={() => toggleMenu("sql")}
        >
          <img src={SqlIcon} alt="sql" />
          <span>SQL</span>
          <span className="arrow">{openMenu === "sql" ? "▾" : "▸"}</span>
        </div>
        {openMenu === "sql" && (
          <div className="sidebar__submenu">
            <NavLink to="/sql/analysis" className="sidebar__subitem">
              SQL 분석
            </NavLink>
            <NavLink to="/sql/top" className="sidebar__subitem">
              Top SQL 비교
            </NavLink>
            <NavLink to="/sql/stat" className="sidebar__subitem">
              SQL 통계
            </NavLink>
          </div>
        )}

        {/* 알림 */}
        <div
          className="sidebar__item--parent"
          onClick={() => toggleMenu("alert")}
        >
          <img src={AlertIcon} alt="alert" />
          <span>알림</span>
          <span className="arrow">{openMenu === "alert" ? "▾" : "▸"}</span>
        </div>
        {openMenu === "alert" && (
          <div className="sidebar__submenu">
            <NavLink to="/alert/event-setting" className="sidebar__subitem">
              이벤트 설정
            </NavLink>
            <NavLink to="/alert/receive-setting" className="sidebar__subitem">
              이벤트 수신 설정
            </NavLink>
            <NavLink to="/alert/log" className="sidebar__subitem">
              이벤트 기록
            </NavLink>
          </div>
        )}

        {/* 진단 */}
        <NavLink
          to="/analysis"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? "active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? ClickedAnalysisIcon : AnalysisIcon}
                alt="analysis"
              />
              진단
            </>
          )}
        </NavLink>

        {/* 개선 */}
        <NavLink
          to="/improvement"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? "active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? ClickedImprovementIcon : ImprovementIcon}
                alt="improvement"
              />
              개선
            </>
          )}
        </NavLink>

        {/* 설정 */}
        <NavLink
          to="/setting"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? "active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? ClickedSettingIcon : SettingIcon}
                alt="setting"
              />
              설정
            </>
          )}
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <img src={SupportIcon} alt="support" />
        고객센터
      </div>
    </aside>
  );
};

export default Sidebar;
