import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./Sidebar.scss";

const Sidebar: React.FC = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img src="/src/assets/logo.svg" alt="logo" />
        <span>CCDB</span>
      </div>

      <nav className="sidebar__nav">
        {/* 대시보드 */}
        <NavLink to="/" className="sidebar__item">
          대시보드
        </NavLink>

        {/* SQL */}
        <div
          className="sidebar__item--parent"
          onClick={() => toggleMenu("sql")}
        >
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
        <NavLink to="/analysis" className="sidebar__item">
          진단
        </NavLink>

        {/* 개선 */}
        <NavLink to="/improvement" className="sidebar__item">
          개선
        </NavLink>

        {/* 설정 */}
        <NavLink to="/setting" className="sidebar__item">
          설정
        </NavLink>
      </nav>

      {/* 고객센터 */}
      <div className="sidebar__footer">고객센터</div>
    </aside>
  );
};

export default Sidebar;
