// 알림 + 테마

import AlertIcon from "@/assets/header/alert.svg";
import LightIcon from "@/assets/header/light.svg";
import DarkIcon from "@/assets/header/dark.svg";
import { useTheme } from "../hooks/useTheme";

interface HeaderRightProps {
  onAlertOpen: () => void;
  unreadCount?: number;
}

const HeaderRight = ({ onAlertOpen, unreadCount = 0 }: HeaderRightProps) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="header__right">
      <div className="header__right-icons">
        <button className="header__right-alert" onClick={onAlertOpen}>
          <img src={AlertIcon} alt="alert" />
          {unreadCount > 0 && (
            <span className="header__right-alert-badge">{unreadCount}</span>
          )}
        </button>

        <div className="header__right-theme-toggle" onClick={toggleTheme}>
          <img src={isDarkMode ? DarkIcon : LightIcon} alt="theme" />
        </div>
      </div>
    </div>
  );
};

export default HeaderRight;
