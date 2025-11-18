import { useState, useEffect } from "react";
import {
  useDashboardContext,
  type DashboardMode,
} from "@/state/DashboardContext";
import { formatClock, formatFullDateTime } from "../utils/timeFormatter";

// LIVE/기간 선택 Dropdown + UI 상태 관리
export const useTimeSection = () => {
  const { mode, rangeMinutes, setMode, triggerRefresh } = useDashboardContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(0);

  // 현재 시간 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (mode === "LIVE") {
        const seconds = now.getSeconds();
        const ms = now.getMilliseconds();
        setProgress(((seconds * 1000 + ms) / 60000) * 100);
      } else {
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [mode]);

  // 범위 시작 계산
  useEffect(() => {
    if (mode === "LIVE" || !rangeMinutes) {
      setRangeStart(null);
    } else {
      setRangeStart(new Date(Date.now() - rangeMinutes * 60_000));
    }
  }, [mode, rangeMinutes]);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const selectRange = (label: DashboardMode, minutes: number | null) => {
    setMode(label, minutes);
    triggerRefresh();
    setShowDropdown(false);
  };

  const isLive = mode === "LIVE";

  const displayText = isLive
    ? formatClock(currentTime)
    : `${
        rangeStart ? formatFullDateTime(rangeStart) + " ~ " : ""
      }${formatFullDateTime(currentTime)}`;

  return {
    isLive,
    progress,
    displayText,
    showDropdown,
    toggleDropdown,
    selectRange,
  };
};
