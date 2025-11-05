import React, { useEffect, useState } from "react";
import "./Header.scss";
import BedgeSuccessIcon from "@/assets/header/bedge-success.svg";
import TimeIcon from "@/assets/header/time.svg";

import Select from "../Select/Select";

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [mode, setMode] = useState<"live" | "range">("live");
  const [selectedRange, setSelectedRange] = useState<string>("LIVE");
  const [rangeStart, setRangeStart] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}/${MM}/${dd}/${hh}:${mm}`;
  };

  const formatClock = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}시 ${mm}분 ${ss}초`;
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
        <div className="header-time__live">
          <img
            src={TimeIcon}
            alt="Time icon"
            className="header-time__icon"
            onClick={() => setShowDropdown((prev) => !prev)}
          />
          <span className="header-time__text">{formatClock(currentTime)}</span>
          <span className="header-time__badge header-time__badge--live">
            LIVE
          </span>
        </div>
      );
    } else if (mode === "range" && rangeStart) {
      return (
        <div className="header-time__range">
          <img
            src={TimeIcon}
            alt="Time icon"
            className="header-time__icon"
            onClick={() => setShowDropdown((prev) => !prev)}
          />
          <span className="header-time__text">
            {formatDateTime(rangeStart)} ~ {formatDateTime(currentTime)}
          </span>
          <span className="header-time__badge">{selectedRange}</span>
        </div>
      );
    }
  };

  return (
    <header className="header">
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
          {renderTimeSection()}

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
      </div>

      <div className="header__right">
        <div className="header__update">
          <div className="header__date">
            {formatDateTime(currentTime).replace(/\//g, "-")}
          </div>
          <div className="header__text">작업 업데이트</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
