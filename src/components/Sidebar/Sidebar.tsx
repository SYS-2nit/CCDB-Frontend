import "./Sidebar.scss";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import WhiteLogoIcon from "@/assets/logo-white.svg";
import SidebarIcon from "@/assets/sidebar/sidebar.svg";
import DashboardIcon from "@/assets/sidebar/dashboard.svg";
import SqlIcon from "@/assets/sidebar/sql.svg";
import AlertIcon from "@/assets/sidebar/alert.svg";
import AnalysisIcon from "@/assets/sidebar/analysis.svg";
import ImprovementIcon from "@/assets/sidebar/improvement.svg";
import SettingIcon from "@/assets/sidebar/setting.svg";
import HistoryIcon from "@/assets/sidebar/history.svg";
import ProfileIcon from "@/assets/sidebar/profile.svg";
import BottomArrowIcon from "@/assets/general/bottom-arrow.svg";
import ClickedTopArrowIcon from "@/assets/general/clicked-top-arrow.svg";

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // 사이드바 축소 상태

  const toggleMenu = (menu: string) => {
    if (isCollapsed) setIsCollapsed(false); // 축소 상태에서 클릭 시 복원
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar__logo">
        <div className="sidebar__logo--left">
          <img
            src={WhiteLogoIcon}
            alt="logoIcon"
            onClick={() => setIsCollapsed(false)}
          />
          {!isCollapsed && <span className="sidebar__title">CCDB</span>}
        </div>

        <img
          src={SidebarIcon}
          alt="sidebarIcon"
          onClick={() => setIsCollapsed(true)}
        />
      </div>

      {/* Divider */}
      <div className="sidebar__divider" />

      {/* Navigation */}
      <nav className="sidebar__nav">
        {/* 대시보드 */}
        <div
          className="sidebar__item--parent--arrow"
          onClick={() => toggleMenu("dashboard")}
        >
          <div className="sidebar__item--parent--left">
            <img src={DashboardIcon} alt="dashboard" />
            <span className="sidebar__item--title">대시보드</span>
            <span className="arrow">
              {openMenu === "dashboard" ? (
                <img src={ClickedTopArrowIcon} alt="clicked-top-arrow" />
              ) : (
                <img src={BottomArrowIcon} alt="bottom-arrow" />
              )}
            </span>
          </div>
        </div>

        {openMenu === "dashboard" && (
          <div className="sidebar__submenu">
            <NavLink to="/dashboard/instance-map" className="sidebar__subitem">
              데이터베이스 맵
            </NavLink>
            <NavLink to="/dashboard/instance-list" className="sidebar__subitem">
              인스턴스 목록
            </NavLink>
          </div>
        )}

        {/* SQL */}
        <div
          className="sidebar__item--parent--arrow"
          onClick={() => toggleMenu("sql")}
        >
          <div className="sidebar__item--parent--left">
            <img src={SqlIcon} alt="sql" />
            <span className="sidebar__item--title">SQL</span>
            <span className="arrow">
              {openMenu === "sql" ? (
                <img src={ClickedTopArrowIcon} alt="clicked-top-arrow" />
              ) : (
                <img src={BottomArrowIcon} alt="bottom-arrow" />
              )}
            </span>
          </div>
        </div>

        {openMenu === "sql" && (
          <div className="sidebar__submenu">
            <NavLink to="/sql/stat" className="sidebar__subitem">
              SQL 통계
            </NavLink>
            <NavLink to="/sql/top" className="sidebar__subitem">
              Top SQL 비교
            </NavLink>
          </div>
        )}

        {/* 알림 */}
        <div
          className="sidebar__item--parent--arrow"
          onClick={() => toggleMenu("alert")}
        >
          <div className="sidebar__item--parent--left">
            <img src={AlertIcon} alt="alert" />
            <span className="sidebar__item--title">알림</span>
            <span className="arrow">
              {openMenu === "alert" ? (
                <img src={ClickedTopArrowIcon} alt="clicked-top-arrow" />
              ) : (
                <img src={BottomArrowIcon} alt="bottom-arrow" />
              )}
            </span>
          </div>
        </div>

        {openMenu === "alert" && (
          <div className="sidebar__submenu">
            <NavLink to="/alert/event-setting" className="sidebar__subitem">
              이벤트 설정
            </NavLink>
            <NavLink to="/alert/event-log" className="sidebar__subitem">
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
          <img
            src={AnalysisIcon}
            alt="analysis"
            onClick={() => setIsCollapsed(false)}
          />
          {!isCollapsed && <span className="sidebar__item--title">진단</span>}
        </NavLink>

        {/* 개선 */}
        <NavLink
          to="/improvement"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? "active" : ""}`
          }
        >
          <img
            src={ImprovementIcon}
            alt="improvement"
            onClick={() => setIsCollapsed(false)}
          />
          {!isCollapsed && <span className="sidebar__item--title">개선</span>}
        </NavLink>

        {/* 히스토리 */}
        <NavLink
          to="/history"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? "active" : ""}`
          }
        >
          <img
            src={HistoryIcon}
            alt="history"
            onClick={() => setIsCollapsed(false)}
          />
          {!isCollapsed && (
            <span className="sidebar__item--title">히스토리</span>
          )}
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <div className="sidebar__nav">
          {/* 설정 */}
          <NavLink
            to="/setting"
            className={({ isActive }) =>
              `sidebar__item ${isActive ? "active" : ""}`
            }
          >
            <img
              src={SettingIcon}
              alt="setting"
              onClick={() => setIsCollapsed(false)}
            />
            {!isCollapsed && <span className="sidebar__item--title">설정</span>}
          </NavLink>

          {/* 사용자 정보 */}
          <div className="sidebar__item--user">
            <img src={ProfileIcon} alt="user" />
            {!isCollapsed && (
              <div className="user-info">
                <span className="sidebar__item--title">사용자</span>
                <span className="user-email">user1@gmail.com</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
