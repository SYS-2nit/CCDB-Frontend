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
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<"live" | "range">("live");
  const [selectedRange, setSelectedRange] = useState<string>("LIVE");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);

  // 시간 + 게이지 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (mode === "live") {
        const seconds = now.getSeconds();
        const ms = now.getMilliseconds();
        const percent = ((seconds * 1000 + ms) / 60000) * 100;
        setProgress(percent);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [mode]);

  const formatClock = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}시 ${mm}분 ${ss}초`;
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

  const handleSelect = (label: string, durationMinutes?: number) => {
    if (label === "LIVE") {
      setMode("live");
      setSelectedRange("LIVE");
      setRangeStart(null);
    } else {
      setMode("range");
      setSelectedRange(`${durationMinutes}분`);
      setRangeStart(new Date(Date.now() - durationMinutes! * 60 * 1000));
    }
    setShowDropdown(false);
  };

  const renderTimeSection = () => {
    if (mode === "live") {
      return (
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
            <span className="header-time__badge header-time__badge--live">
              LIVE
            </span>
          </div>
          {/* LIVE 게이지 */}
          <div className="header-time__bar">
            <div
              className="header-time__progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* 드롭다운 */}
          {showDropdown && (
            <div className="header-time__dropdown">
              <div
                className="header-time__option"
                onClick={() => handleSelect("LIVE")}
              >
                실시간 (LIVE)
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelect("10분", 10)}
              >
                실시간 10분
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelect("1시간", 60)}
              >
                실시간 1시간
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelect("1일", 1440)}
              >
                실시간 1일
              </div>
            </div>
          )}
        </div>
      );
    } else if (mode === "range" && rangeStart) {
      return (
        <div className="header-time">
          <div className="header-time__info">
            <img
              src={TimeIcon}
              alt="Time icon"
              className="header-time__icon"
              onClick={() => setShowDropdown((prev) => !prev)}
            />
            <span className="header-time__text">
              {formatFullDateTime(rangeStart)} ~{" "}
              {formatFullDateTime(currentTime)}
            </span>
            <span className="header-time__badge">{selectedRange}</span>
          </div>

          {/* 드롭다운 */}
          {showDropdown && (
            <div className="header-time__dropdown">
              <div
                className="header-time__option"
                onClick={() => handleSelect("LIVE")}
              >
                실시간 (LIVE)
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelect("10분", 10)}
              >
                실시간 10분
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelect("1시간", 60)}
              >
                실시간 1시간
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelect("1일", 1440)}
              >
                실시간 1일
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <header className="header">
      {/* 왼쪽: DB + 인스턴스 + 시간 */}
      <div className="header__left">
        <div className="header__dbinfo">
          <img src={BedgeSuccessIcon} alt="DB badge" />
          <div className="header__dbname">DB Name</div>
        </div>

        <Select
          placeholder="인스턴스 선택"
          size="sm"
          options={[
            { label: "인스턴스 1", value: "1" },
            { label: "인스턴스 2", value: "2" },
          ]}
        />

        {renderTimeSection()}
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
