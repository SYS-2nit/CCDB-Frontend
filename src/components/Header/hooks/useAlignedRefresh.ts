/* eslint-disable prefer-const */
import { useEffect } from "react";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

// 1분 정각 refresh 스케줄링
export const useAlignedRefresh = (enabled: boolean, refresh: () => void) => {
  useEffect(() => {
    if (!enabled) return;

    let timeoutId: number;
    let intervalId: number;

    const now = new Date();
    const ms = (now.getSeconds() * 1000 + now.getMilliseconds()) % 60_000;
    const wait = ms === 0 ? 60_000 : 60_000 - ms;

    timeoutId = window.setTimeout(() => {
      refresh();
      intervalId = window.setInterval(refresh, 60_000);
    }, wait);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [enabled, refresh]);
};
