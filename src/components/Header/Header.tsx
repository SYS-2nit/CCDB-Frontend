import React, { useEffect, useState } from "react";
import "./Header.scss";
import BedgeSuccessIcon from "@/assets/header/bedge-success.svg";
import TimeIcon from "@/assets/header/time.svg";
import AlertIcon from "@/assets/header/alert.svg";
import LightIcon from "@/assets/header/light.svg";
import DarkIcon from "@/assets/header/dark.svg";
import Select from "../Select/Select";

const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [progressDuration, setProgressDuration] = useState(60000); // 기본 1분
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const totalMs = progressDuration;
      const elapsed =
        (now.getMinutes() * 60 + now.getSeconds()) * 1000 +
        now.getMilliseconds();

      // progress 계산 (현재 시간 % 선택된 주기)
      const progressValue = ((elapsed % totalMs) / totalMs) * 100;
      setProgress(progressValue);
    }, 100);

    return () => clearInterval(timer);
  }, [progressDuration]);

  const formatClock = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const formatFullDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  // progress 기간 변경 핸들러
  const handleSelectDuration = (value: number) => {
    setProgressDuration(value);
    setShowDropdown(false);
  };

  return (
    <header className="header">
      {/* 왼쪽: DB 이름 + 인스턴스 선택 + 시계 게이지 */}
      <div className="header__left">
        <div className="header__dbinfo">
          <img src={BedgeSuccessIcon} alt="DB badge" />
          <div className="header__dbname">DB Name</div>
        </div>

        <Select
          placeholder="인스턴스 선택"
          size="md"
          options={[
            { label: "인스턴스 1", value: "1" },
            { label: "인스턴스 2", value: "2" },
          ]}
        />

        <div className="header-time">
          <div className="header-time__info">
            <img
              src={TimeIcon}
              alt="Time icon"
              className="header-time__icon"
              onClick={() => setShowDropdown((prev) => !prev)}
            />
            <span className="header-time__text">
              {formatClock(currentTime)}
            </span>
          </div>

          {/* progress bar */}
          <div className="header-time__bar">
            <div
              className="header-time__progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* dropdown 메뉴 */}
          {showDropdown && (
            <div className="header-time__dropdown">
              <div
                className="header-time__option"
                onClick={() => handleSelectDuration(10 * 60 * 1000)} // 10분
              >
                10분
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelectDuration(60 * 60 * 1000)} // 1시간
              >
                1시간
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelectDuration(24 * 60 * 60 * 1000)} // 하루
              >
                하루
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 알림 + 테마 + 현재 시간 표시 */}
      <div className="header__right">
        <div className="header__right-icons">
          <button className="header__right-alert">
            <img src={AlertIcon} alt="alert" />
          </button>
          <div
            className="header__right-theme-toggle"
            onClick={() => setIsDarkMode((prev) => !prev)}
          >
            <img src={isDarkMode ? DarkIcon : LightIcon} alt="theme" />
          </div>
        </div>

        <div className="header__update">
          <div className="header__date">{formatFullDateTime(currentTime)}</div>
          <div className="header__text">최종 업데이트</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
