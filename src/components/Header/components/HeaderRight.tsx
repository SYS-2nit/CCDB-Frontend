// 알림 + 테마 + 업데이트 정보

import AlertIcon from "@/assets/header/alert.svg";
import LightIcon from "@/assets/header/light.svg";
import DarkIcon from "@/assets/header/dark.svg";
import { useTheme } from "../hooks/useTheme";
import { useLiveClock } from "../hooks/useLiveClock";

const HeaderRight = ({ onAlertOpen }: { onAlertOpen: () => void }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { now, fullDateTime } = useLiveClock();

  return (
    <div className="header__right">
      <div className="header__right-icons">
        <button className="header__right-alert" onClick={onAlertOpen}>
          <img src={AlertIcon} alt="alert" />
        </button>

        <div className="header__right-theme-toggle" onClick={toggleTheme}>
          <img src={isDarkMode ? DarkIcon : LightIcon} alt="theme" />
        </div>
      </div>

      <div className="header__update">
        <div className="header__date">{fullDateTime(now)}</div>
        <div className="header__text">최종 업데이트</div>
      </div>
    </div>
  );
};

export default HeaderRight;
