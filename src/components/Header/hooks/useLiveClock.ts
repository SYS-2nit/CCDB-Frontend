import { useState, useEffect } from "react";
import { formatFullDateTimeMinutes } from "../utils/timeFormatter";

// HeaderRight용 간단 LIVE 시간 Hook
export const useLiveClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return {
    now,
    fullDateTime: formatFullDateTimeMinutes,
  };
};
