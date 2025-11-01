import React, { useEffect, useState } from "react";
import "./Header.scss";
import BedgeSuccessIcon from "@/assets/header/bedge-success.svg";
import TimeIcon from "@/assets/header/time.svg";
import AlertIcon from "@/assets/header/alert.svg";
import LightIcon from "@/assets/header/light.svg";
import DarkIcon from "@/assets/header/dark.svg";

interface HeaderProps {
  showTime?: boolean;
  theme?: "default" | "database";
}

const Header: React.FC<HeaderProps> = ({
  showTime = true,
  theme = "default",
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      return true;
    } else if (savedTheme === "light") {
      document.body.classList.remove("dark");
      return false;
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) document.body.classList.add("dark");
      return prefersDark;
    }
  });

  const [showAlertPanel, setShowAlertPanel] = useState(false);

  const handleModeToggle = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle("dark", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [seconds, setSeconds] = useState(currentTime.getSeconds());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setSeconds(now.getSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const progressPercent = (seconds / 60) * 100;

  const formatDateTime = (
    date: Date,
    mode: "full" | "minuteOnly" | "timeOnly" = "full"
  ) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    if (mode === "timeOnly") return `${hh}:${min}:${ss}`;
    if (mode === "minuteOnly") return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  const headerClass = `header ${
    theme === "database" ? "header--database" : ""
  }`;

  return (
    <>
      <header className={headerClass}>
        {/* 왼쪽 영역 */}
        <div className="header__left">
          <div className="header__status">
            <img src={BedgeSuccessIcon} alt="Bedge Success Icon" />
            <div className="header__title">DB Name</div>
          </div>

          {showTime && (
            <div className="header__time">
              <div className="header__time--wrapper">
                <div
                  className="header__time--progress"
                  style={{ width: `${progressPercent}%` }}
                ></div>
                <img
                  src={TimeIcon}
                  alt="Time Icon"
                  className="header__time--icon"
                />
                <div className="header__time--title">
                  {formatDateTime(currentTime, "timeOnly")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 오른쪽 영역 */}
        <div className="header__right">
          {/* 알림 */}
          <div
            className="header__alert"
            onClick={() => setShowAlertPanel(true)}
          >
            <img src={AlertIcon} alt="Alert Icon" />
          </div>

          {/* 라이트 / 다크 모드 */}
          <div className="header__mode" onClick={handleModeToggle}>
            <div
              className={`header__light ${
                !isDarkMode ? "header__mode--active" : ""
              }`}
            >
              <img src={LightIcon} alt="Light Icon" />
            </div>
            <div
              className={`header__dark ${
                isDarkMode ? "header__mode--active" : ""
              }`}
            >
              <img src={DarkIcon} alt="Dark Icon" />
            </div>
          </div>

          {/* 사용자 */}
          <div className="header__update">
            <span className="header__date">
              {formatDateTime(currentTime, "minuteOnly")}
            </span>
            <span className="header__text">최종 업데이트</span>
          </div>
        </div>
      </header>

      {/* 알림 패널 */}
      {showAlertPanel && (
        <div
          className="alert-panel__overlay"
          onClick={() => setShowAlertPanel(false)}
        >
          <div className="alert-panel" onClick={(e) => e.stopPropagation()}>
            <div className="alert-panel__header">
              <h3>알림 목록</h3>
              <button
                className="alert-panel__close"
                onClick={() => setShowAlertPanel(false)}
              >
                ✕
              </button>
            </div>
            <div className="alert-panel__content">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="alert-item">
                  <div className="alert-item__icon">⚠️</div>
                  <div className="alert-item__text">
                    <strong>그래프 이름</strong> 에 에러 메시지 요약이
                    발견되었습니다.
                    <div className="alert-item__sub">N분 전 · DB명</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
