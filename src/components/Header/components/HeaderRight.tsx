import AlertIcon from "@/assets/header/alert.svg";
import LightIcon from "@/assets/header/light.svg";
import DarkIcon from "@/assets/header/dark.svg";
import { useTheme } from "../hooks/useTheme";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface HeaderRightProps {
  unreadCount?: number;
  onAlertOpen: () => void;
}

const HeaderRight = ({ unreadCount = 0, onAlertOpen }: HeaderRightProps) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="header__right">
      <div className="header__right-icons">
        {/* 알림 버튼 */}
        <button className="header__right-alert" onClick={onAlertOpen}>
          <img src={AlertIcon} alt="alert" />
          {unreadCount > 0 && (
            <span className="header__right-alert-badge">{unreadCount}</span>
          )}
        </button>

        {/* 테마 토글 */}
        <div className="header__right-theme-toggle" onClick={toggleTheme}>
          <img src={isDarkMode ? DarkIcon : LightIcon} alt="theme" />
        </div>
      </div>
    </div>
  );
};

export default HeaderRight;
