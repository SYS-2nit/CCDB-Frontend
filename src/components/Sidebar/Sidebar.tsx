import "./Sidebar.scss";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
import SidebarParentItem from "./SidebarParentItem";
import SidebarItem from "./SidebarItem";
import SidebarHoverModal from "./Modal/SidebarHoverModal";

const menuRoutes: Record<string, string[]> = {
  dashboard: ["/dashboard/instance-map", "/dashboard/instance-list"],
  sql: ["/sql/stat", "/sql/top"],
  alert: ["/alert/event-setting", "/alert/event-log"],
  analysis: ["/analysis"],
  improvement: ["/improvement"],
  history: ["/history"],
  setting: ["/setting"],
  logo: ["/dashboard"],
};

/* ===== 사이드바 ===== */
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // hover tooltip 관리
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );

  /** 대시보드 자동 열림 */
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) {
      setOpenMenu("dashboard");
    }
  }, [location.pathname]);

  /** accordion toggle */
  const toggleMenu = (menu: string) => {
    if (isCollapsed) return;
    setOpenMenu(openMenu === menu ? null : menu);
  };

  /** Hover Modal Position 계산 */
  const handleHover = (e: React.MouseEvent, menuKey: string) => {
    if (!isCollapsed) return;
    setHoverMenu(menuKey);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoverPos({ x: rect.right - 11, y: rect.top + 12 });
  };

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""}`}>
      {/* Header 영역 */}
      <div className="sidebar__logo">
        <div className="sidebar__item--parent--arrow-left">
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

      <div className="sidebar__divider" />

      {/* Navigation */}
      <nav className="sidebar__nav">
        {/* 대시보드 */}
        <div
          onMouseEnter={(e) => handleHover(e, "dashboard")}
          onMouseLeave={() => isCollapsed && setHoverMenu(null)}
        >
          <SidebarParentItem
            icon={DashboardIcon}
            label="대시보드"
            menuKey="dashboard"
            openMenu={openMenu}
            toggleMenu={toggleMenu}
            isCollapsed={isCollapsed}
          >
            <div className="sidebar__submenu">
              <NavLink
                to="/dashboard/instance-map"
                className="sidebar__subitem"
              >
                데이터베이스 맵
              </NavLink>
              <NavLink
                to="/dashboard/instance-list"
                className="sidebar__subitem"
              >
                인스턴스 목록
              </NavLink>
            </div>
          </SidebarParentItem>
        </div>

        {/* SQL */}
        <div
          onMouseEnter={(e) => handleHover(e, "sql")}
          onMouseLeave={() => isCollapsed && setHoverMenu(null)}
        >
          <SidebarParentItem
            icon={SqlIcon}
            label="SQL"
            menuKey="sql"
            openMenu={openMenu}
            toggleMenu={toggleMenu}
            isCollapsed={isCollapsed}
          >
            <div className="sidebar__submenu">
              <NavLink to="/sql/stat" className="sidebar__subitem">
                SQL 통계
              </NavLink>
              <NavLink to="/sql/top" className="sidebar__subitem">
                Top SQL 비교
              </NavLink>
            </div>
          </SidebarParentItem>
        </div>

        {/* 알림 */}
        <div
          onMouseEnter={(e) => handleHover(e, "alert")}
          onMouseLeave={() => isCollapsed && setHoverMenu(null)}
        >
          <SidebarParentItem
            icon={AlertIcon}
            label="알림"
            menuKey="alert"
            openMenu={openMenu}
            toggleMenu={toggleMenu}
            isCollapsed={isCollapsed}
          >
            <div className="sidebar__submenu">
              <NavLink to="/alert/event-setting" className="sidebar__subitem">
                이벤트 설정
              </NavLink>
              <NavLink to="/alert/event-log" className="sidebar__subitem">
                이벤트 기록
              </NavLink>
            </div>
          </SidebarParentItem>
        </div>

        {/* 자식 없는 메뉴들 */}
        <div
          onMouseEnter={(e) => handleHover(e, "analysis")}
          onMouseLeave={() => isCollapsed && setHoverMenu(null)}
        >
          <SidebarItem
            to="/analysis"
            icon={AnalysisIcon}
            label="진단"
            isCollapsed={isCollapsed}
          />
        </div>

        <div
          onMouseEnter={(e) => handleHover(e, "improvement")}
          onMouseLeave={() => isCollapsed && setHoverMenu(null)}
        >
          <SidebarItem
            to="/improvement"
            icon={ImprovementIcon}
            label="보고서"
            isCollapsed={isCollapsed}
          />
        </div>

        <div
          onMouseEnter={(e) => handleHover(e, "history")}
          onMouseLeave={() => isCollapsed && setHoverMenu(null)}
        >
          <SidebarItem
            to="/history"
            icon={HistoryIcon}
            label="히스토리"
            isCollapsed={isCollapsed}
          />
        </div>
      </nav>

      {/* Footer */}
      <div
        className="sidebar__footer"
        onMouseEnter={(e) => handleHover(e, "setting")}
        onMouseLeave={() => isCollapsed && setHoverMenu(null)}
      >
        <SidebarItem
          to="/setting"
          icon={SettingIcon}
          label="설정"
          isCollapsed={isCollapsed}
        />

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

      {/* Hover Modal */}
      {isCollapsed && hoverMenu && hoverPos && (
        <SidebarHoverModal
          pos={hoverPos}
          items={
            {
              dashboard: ["데이터베이스 맵", "인스턴스 목록"],
              sql: ["SQL 통계", "Top SQL 비교"],
              alert: ["이벤트 설정", "이벤트 기록"],
              analysis: ["진단"],
              improvement: ["보고서"],
              history: ["히스토리"],
              setting: ["설정"],
              logo: ["CCDB"],
            }[hoverMenu] || []
          }
          onEnter={() => setHoverMenu(hoverMenu)}
          onLeave={() => setHoverMenu(null)}
          onSelect={(index) => {
            const routeList = menuRoutes[hoverMenu] || [];
            const target = routeList[index];
            if (target) navigate(target); // 실제 페이지 이동
            setHoverMenu(null); // 모달 닫기
          }}
        />
      )}
    </aside>
  );
};

export default Sidebar;
