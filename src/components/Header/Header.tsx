import React, { useEffect, useState } from "react";
import "./Header.scss";
import BedgeSuccessIcon from "../../assets/header/bedge-success.svg";
import TimeIcon from "@/assets/header/time.svg";
import AlertIcon from "@/assets/header/alert.svg";
import LightIcon from "@/assets/header/light.svg";
import DarkIcon from "@/assets/header/dark.svg";
import ProfileIcon from "@/assets/header/profile.svg";
import BottomArrowIcon from "@/assets/general/bottom-arrow.svg";

const Header: React.FC = () => {
  // 다크모드 상태 관리 (로컬스토리지 + 시스템 기본값)
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

  const handleModeToggle = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      console.log("기존 모드:", prev ? "dark" : "light");
      console.log("새 모드:", newMode ? "dark" : "light");

      document.body.classList.toggle("dark", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");

      console.log("현재 body.classList:", document.body.classList.toString());
      console.log("로컬스토리지 theme:", localStorage.getItem("theme"));

      return newMode;
    });
  };

  // 타이머 상태 관리
  const [remainingTime, setRemainingTime] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 시간 포맷 함수
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `0:${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  // 흰색 배경 줄이는 비율 계산
  const progressPercent = (remainingTime / 60) * 100;

  // UI
  return (
    <header className="header">
      {/* 왼쪽 영역 */}
      <div className="header__left">
        {/* DB 상태 및 이름 */}
        <div className="header__status">
          <img src={BedgeSuccessIcon} alt="Bedge Success Icon" />
          <div className="header__title">DB Name</div>
        </div>

        {/* 시간 표시 */}
        <div className="header__time">
          <img src={TimeIcon} alt="Time Icon" />
          <div className="header__time--wrapper">
            <div
              className="header__time--progress"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "white",
              }}
            ></div>
            <div className="header__time--title">
              {formatTime(remainingTime)}
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 영역 */}
      <div className="header__right">
        {/* 알림 */}
        <div className="header__alert">
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
        <div className="header__user">
          <img src={ProfileIcon} alt="Profile Icon" />
          <div className="header__userinfo">
            <span className="header__username">유저1</span>
            <span className="header__email">user1@gmail.com</span>
          </div>
          <img src={BottomArrowIcon} alt="Bottom Arrow Icon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
