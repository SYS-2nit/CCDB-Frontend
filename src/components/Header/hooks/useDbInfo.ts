import { useEffect } from "react";
import { useDashboardContext } from "@/state/DashboardContext";

const SELECTED_DB_STORAGE_KEY = "selectedDatabase";

// DB 정보 로딩 및 변경 이벤트
export const useDbInfo = () => {
  const { dbId, dbName, setDbInfo, clearGraphs, setInstances, selectInstance } =
    useDashboardContext();

  // 초기값 로딩
  useEffect(() => {
    const stored = sessionStorage.getItem(SELECTED_DB_STORAGE_KEY);

    if (!stored) {
      setDbInfo({ id: null, name: null });
      clearGraphs();
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const id = Number(parsed.id);

      setDbInfo({
        id: !isNaN(id) ? id : null,
        name: parsed.name ?? null,
      });
    } catch {
      setDbInfo({ id: null, name: null });
    }
  }, [setDbInfo, clearGraphs]);

  // DB 선택 이벤트 리스너
  useEffect(() => {
    const handleDbChange = (e: Event) => {
      const detail = (
        e as CustomEvent<{ id: number | null; name: string | null }>
      ).detail;
      if (!detail) return;

      setDbInfo({ id: detail.id, name: detail.name });

      if (!detail.id) {
        setInstances([]);
        selectInstance(null);
        clearGraphs();
        sessionStorage.removeItem(SELECTED_DB_STORAGE_KEY);
      } else {
        sessionStorage.setItem(
          SELECTED_DB_STORAGE_KEY,
          JSON.stringify({ id: detail.id, name: detail.name })
        );
      }
    };

    window.addEventListener("dashboard:selected-db", handleDbChange);
    return () =>
      window.removeEventListener("dashboard:selected-db", handleDbChange);
  }, [setDbInfo, setInstances, clearGraphs, selectInstance]);

  return { dbId, dbName };
};
