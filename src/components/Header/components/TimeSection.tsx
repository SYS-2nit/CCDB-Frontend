import TimeIcon from "@/assets/header/time.svg";
import { useTimeSection } from "../hooks/useTimeSection";

// LIVE/시간 범위 컴포넌트
const TimeSection = () => {
  const {
    isLive,
    progress,
    displayText,
    showDropdown,
    toggleDropdown,
    selectRange,
  } = useTimeSection();

  return (
    <div className="header-time">
      <div className="header-time__info">
        <img
          src={TimeIcon}
          alt="time"
          className="header-time__icon"
          onClick={toggleDropdown}
        />
        <span className="header-time__text">{displayText}</span>
        {isLive && (
          <span className="header-time__badge header-time__badge--live">
            LIVE
          </span>
        )}
      </div>

      {isLive && (
        <div className="header-time__bar">
          <div
            className="header-time__progress"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {showDropdown && (
        <div className="header-time__dropdown">
          <div
            className="header-time__option"
            onClick={() => selectRange("LIVE", null)}
          >
            실시간
          </div>
          <div
            className="header-time__option"
            onClick={() => selectRange("10분", 10)}
          >
            10분
          </div>
          <div
            className="header-time__option"
            onClick={() => selectRange("1시간", 60)}
          >
            1시간
          </div>
          <div
            className="header-time__option"
            onClick={() => selectRange("1일", 1440)}
          >
            1일
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSection;
