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
import LogoutIcon from "@/assets/sidebar/logout.svg";
import ProfileIcon from "@/assets/sidebar/profile.svg";
import BottomArrowIcon from "@/assets/general/bottom-arrow.svg";
import ClickedTopArrowIcon from "@/assets/general/clicked-top-arrow.svg";

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // 사이드바 축소 상태

  const toggleMenu = (menu: string) => {
    // 축소된 상태에서 메뉴 클릭 시 복원
    if (isCollapsed) {
      setIsCollapsed(false);
    }
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
            onClick={() => setIsCollapsed(false)} // 복원
          />
          {!isCollapsed && <span className="sidebar__title">CCDB</span>}
        </div>

        <img
          src={SidebarIcon}
          alt="sidebarIcon"
          onClick={() => setIsCollapsed(true)} // 축소
        />
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
          <>
            <img
              src={DashboardIcon}
              alt="dashboard"
              onClick={() => setIsCollapsed(false)}
            />
            {!isCollapsed && (
              <span className="sidebar__item--title">대시보드</span>
            )}
          </>
        </NavLink>

        {/* SQL */}
        <div
          className="sidebar__item--parent--arrow"
          onClick={() => toggleMenu("sql")}
        >
          <div className="sidebar__item--parent--left">
            <img src={SqlIcon} alt="sql" />
            <span className="sidebar__item--title">SQL</span>
          </div>
          <span className="arrow">
            {openMenu === "sql" ? (
              <img
                src={ClickedTopArrowIcon}
                alt="clicked-top-arrow"
                onClick={() => setIsCollapsed(false)}
              />
            ) : (
              <img
                src={BottomArrowIcon}
                alt="bottom-arrow"
                onClick={() => setIsCollapsed(false)}
              />
            )}
          </span>
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
          className="sidebar__item--parent--arrow"
          onClick={() => toggleMenu("alert")}
        >
          <div className="sidebar__item--parent--left">
            <img src={AlertIcon} alt="alert" />
            <span className="sidebar__item--title">알림</span>
          </div>
          <span className="arrow">
            {openMenu === "alert" ? (
              <img src={ClickedTopArrowIcon} alt="clicked-top-arrow" />
            ) : (
              <img src={BottomArrowIcon} alt="bottom-arrow" />
            )}
          </span>
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
          <>
            <img
              src={AnalysisIcon}
              alt="analysis"
              onClick={() => setIsCollapsed(false)}
            />
            {!isCollapsed && <span className="sidebar__item--title">진단</span>}
          </>
        </NavLink>

        {/* 개선 */}
        <NavLink
          to="/improvement"
          className={({ isActive }) =>
            `sidebar__item ${isActive ? "active" : ""}`
          }
        >
          <>
            <img
              src={ImprovementIcon}
              alt="improvement"
              onClick={() => setIsCollapsed(false)}
            />
            {!isCollapsed && <span className="sidebar__item--title">개선</span>}
          </>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        {/* 설정 */}
        <div className="sidebar__footer--setting">
          <img src={SettingIcon} alt="setting" />
          {!isCollapsed && <span className="sidebar__item--title">설정</span>}
        </div>

        <div className="sidebar__footer--logout">
          <img src={LogoutIcon} alt="logout" />
          {!isCollapsed && <span className="sidebar__item--title">나가기</span>}
        </div>

        <div className="sidebar__footer--user">
          <img src={ProfileIcon} alt="user" />
          {!isCollapsed && (
            <div className="user-info">
              <span className="sidebar__item--title">유저 1</span>
              <span className="user-email">user1@gmail.com</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
