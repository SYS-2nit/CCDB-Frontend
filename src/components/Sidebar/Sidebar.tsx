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
import SidebarParentItem from "./components/SidebarParentItem";
import SidebarItem from "./components/SidebarItem";
import SidebarHoverModal from "./Modal/SidebarHoverModal";
import { fetchMembers, type Member } from "@/api/Member/member";
import UserListModal from "./Modal/UserListModal";
import { useSelectedInstanceStore } from "@/state/useInstanceStore";
import Spinner from "../Spinner/Spinner";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

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

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { selectedInstanceId } = useSelectedInstanceStore();

  // 대시보드 클릭 시 바로 이동 (라벨 클릭 시)
  const handleDashboardClick = () => {
    const targetId = selectedInstanceId ?? 1; // fallback 1 (원한다면 null 체크 후 alert로 변경 가능)
    navigate(`/dashboard?instanceId=${targetId}`);
  };

  // 대시보드 부모 탭 클릭 시 첫 번째 자식으로 이동하고 메뉴 열기
  const handleDashboardParentClick = () => {
    if (isCollapsed) return;

    // 메뉴가 닫혀있으면 열기
    if (openMenu !== "dashboard") {
      setOpenMenu("dashboard");
    }
    // 첫 번째 자식으로 이동
    navigate("/dashboard/instance-map");
  };

  /** -------------------------
   *  사용자 정보 상태
   *  ------------------------- */
  const [currentUser, setCurrentUser] = useState<Member | null>(null); // 단일 사용자
  const [members, setMembers] = useState<Member[]>([]); // 전체 목록
  const [loading, setLoading] = useState(true);

  /** -------------------------
   *  Hover Tooltip 상태
   *  ------------------------- */
  const [hoverMenu, setHoverMenu] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );

  /** -------------------------
   *  사용자 모달
   *  ------------------------- */
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const openUserModal = async () => {
    try {
      const data = await fetchMembers(); // 전체 회원 목록
      setMembers(data); // 목록 저장
      setIsUserModalOpen(true);
    } catch (e) {
      console.error("회원 목록 조회 실패", e);
    }
  };

  /** -------------------------
   *  페이지 로드시 사용자 정보 로드
   *  ------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMembers();
        setMembers(data);
        setCurrentUser(data[0]); // 첫 번째 회원을 현재 사용자로 가정
      } catch (err) {
        console.error("사용자 정보 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /** 자동으로 대시보드 메뉴 펼침 */
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard")) {
      setOpenMenu("dashboard");
    }
  }, [location.pathname]);

  /** 아코디언 toggle */
  const toggleMenu = (menu: string) => {
    if (isCollapsed) return;
    setOpenMenu(openMenu === menu ? null : menu);
  };

  /** 부모 탭 클릭 시 첫 번째 자식으로 이동하고 메뉴 열기 */
  const handleParentClick = (menuKey: string) => {
    if (isCollapsed) return;

    const routes = menuRoutes[menuKey];
    if (routes && routes.length > 0) {
      // 메뉴가 닫혀있으면 열기
      if (openMenu !== menuKey) {
        setOpenMenu(menuKey);
      }
      // 첫 번째 자식으로 이동
      navigate(routes[0]);
    }
  };

  /** Hover 모달 위치 계산 */
  const handleHover = (e: React.MouseEvent, menuKey: string) => {
    if (!isCollapsed) return;
    setHoverMenu(menuKey);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setHoverPos({ x: rect.right - 11, y: rect.top + 12 });
  };

  /** 로딩 중 */
  if (loading || !currentUser)
    return <Spinner message="사용자 정보를 불러오는 중..." />;

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
        <div
          onMouseEnter={(e) => handleHover(e, "dashboard")}
          onMouseLeave={() => isCollapsed && setHoverMenu(null)}
          style={{ cursor: "pointer" }}
        >
          <SidebarParentItem
            icon={DashboardIcon}
            label="대시보드"
            menuKey="dashboard"
            openMenu={openMenu}
            toggleMenu={toggleMenu}
            isCollapsed={isCollapsed}
            onClick={handleDashboardParentClick}
            onParentClick={handleDashboardClick}
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
            onClick={() => handleParentClick("sql")}
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
            onClick={() => handleParentClick("alert")}
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

        {/* 자식 없는 메뉴 */}
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

        {/* 사용자 영역 */}
        <div
          className="sidebar__item--user"
          onClick={openUserModal}
          style={{ cursor: "pointer" }}
        >
          <img src={ProfileIcon} alt="user" />
          {!isCollapsed && currentUser && (
            <div className="user-info">
              <span className="sidebar__item--title">
                {currentUser.username}
              </span>
              <span className="user-email">{currentUser.email}</span>
            </div>
          )}
        </div>

        {isUserModalOpen && (
          <UserListModal
            members={members} // 전체 사용자 목록 전달
            onClose={() => setIsUserModalOpen(false)}
          />
        )}
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
            if (target) navigate(target);
            setHoverMenu(null);
          }}
        />
      )}
    </aside>
  );
};

export default Sidebar;
