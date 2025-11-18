/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useDashboardContext } from "@/state/DashboardContext";
import { formatClock, formatFullDateTimeMinutes } from "../utils/timeFormatter";

// 시간 선택 Hook
export const useTimeSection = () => {
  const { mode, rangeMinutes, setMode, triggerRefresh } = useDashboardContext();

  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [progress, setProgress] = useState(0);

  const [pausedTime, setPausedTime] = useState<Date | null>(null);
  const [pausedProgress, setPausedProgress] = useState<number | null>(null);

  const isLive = mode === "LIVE";

  /** LIVE 타이머 동작 */
  useEffect(() => {
    if (!isLive) return;

    if (isPaused) return;

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const seconds = now.getSeconds();
      const ms = now.getMilliseconds();
      setProgress(((seconds * 1000 + ms) / 60000) * 100);
    }, 100);

    return () => clearInterval(timer);
  }, [mode, isPaused]);

  /** PAUSE → RESUME 시 기존 값 사용 */
  useEffect(() => {
    if (!isLive) return;

    if (isPaused) {
      setPausedTime(currentTime);
      setPausedProgress(progress);
    } else {
      // resume → 저장된 시점에서 다시 시작
      if (pausedTime) setCurrentTime(pausedTime);
      if (pausedProgress !== null) setProgress(pausedProgress);
    }
  }, [isPaused]);

  const togglePause = () => {
    if (!isLive) return;
    setIsPaused((prev) => !prev);
  };

  /** Live 모드일 때 시간 표시 */
  const displayText = isLive
    ? formatClock(currentTime)
    : `${formatFullDateTimeMinutes(
        new Date(Date.now() - (rangeMinutes ?? 0) * 60000)
      )} ~ ${formatFullDateTimeMinutes(currentTime)}`;

  const selectRange = (label: any, minutes: number | null) => {
    setMode(label, minutes);
    triggerRefresh();
    setIsPaused(false);
  };

  return {
    isLive,
    isPaused,
    togglePause,
    progress,
    displayText,
    selectRange,
  };
};
