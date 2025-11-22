import type { DashboardMode } from "@/state/DashboardContext";
import { useTimeSection } from "../hooks/useTimeSection";
import Button from "@/components/Button/Button";
import PauseIcon from "@/assets/general/pause.svg";
import StartIcon from "@/assets/general/start.svg";

const TimeSection = () => {
  const { isPaused, togglePause, displayText, selectRange } = useTimeSection();

  const ranges: {
    label: string;
    mode: DashboardMode;
    minutes: number | null;
  }[] = [
    { label: "LIVE", mode: "LIVE", minutes: null },
    { label: "10분", mode: "10분", minutes: 10 },
    { label: "1시간", mode: "1시간", minutes: 60 },
    { label: "1일", mode: "1일", minutes: 1440 },
  ];

  return (
    <div className="header-time">
      <div className="header-time__info">
        {/* Pause / Start Toggle Icon */}
        <img
          src={isPaused ? StartIcon : PauseIcon}
          alt="Pause Icon"
          className="header-time__pause"
          onClick={togglePause}
          style={{ cursor: "pointer" }}
        />

        {/* 게이지 + 텍스트 */}
        <div className="header-time__gage">
          <span className="header-time__text">{displayText}</span>
        </div>

        {/* 버튼들 */}
        {ranges.map((r) => (
          <Button
            size="xs"
            variant="primary"
            text={r.label}
            key={r.label}
            onClick={() => selectRange(r.mode, r.minutes)}
          />
        ))}
      </div>
    </div>
  );
};

export default TimeSection;
