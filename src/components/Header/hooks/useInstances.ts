import { useEffect } from "react";
import {
  fetchInstancesByDatabase,
  type DatabaseInstanceListItem,
} from "@/api/Databases/databases";
import {
  useDashboardContext,
  type InstanceOption,
} from "@/state/DashboardContext";
import { getErrorMessage } from "../utils/error";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

// DB 인스턴스 목록 + 선택 기능
export const useInstances = () => {
  const {
    dbId,
    instances,
    setInstances,
    selectedInstanceId,
    selectInstance,
    triggerRefresh,
    clearGraphs,
    setError,
  } = useDashboardContext();

  // DB 변경 시 인스턴스 목록 로드
  useEffect(() => {
    if (!dbId) {
      setInstances([]);
      selectInstance(null);
      clearGraphs();
      return;
    }

    let mounted = true;

    const mapToOption = (i: DatabaseInstanceListItem): InstanceOption => ({
      id: i.id,
      label: i.sid ?? i.serverName ?? i.databaseName ?? `SID ${i.id}`,
      sid: i.sid ?? null,
    });

    const load = async () => {
      try {
        const response = await fetchInstancesByDatabase(dbId);
        if (!mounted) return;

        const options = response.map(mapToOption);
        setInstances(options);

        let selected: InstanceOption | null = null;
        const saved = sessionStorage.getItem("selectedInstance");

        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const id = Number(parsed.id);
            selected = options.find((o) => o.id === id) ?? null;
          } catch {
            /* empty */
          }
        }

        if (!selected && options.length > 0) selected = options[0];

        selectInstance(selected);

        if (selected) {
          sessionStorage.setItem(
            "selectedInstance",
            JSON.stringify({ id: selected.id, name: selected.label })
          );
          triggerRefresh();
        } else {
          clearGraphs();
        }

        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(getErrorMessage(e));
        setInstances([]);
        selectInstance(null);
        clearGraphs();
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [
    dbId,
    setInstances,
    selectInstance,
    triggerRefresh,
    clearGraphs,
    setError,
  ]);

  // 인스턴스 선택 핸들러
  const handleInstanceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const next = instances.find((i) => i.id === id) ?? null;

    selectInstance(next);

    if (next) {
      sessionStorage.setItem(
        "selectedInstance",
        JSON.stringify({ id: next.id, name: next.label })
      );
      window.dispatchEvent(
        new CustomEvent("dashboard:selected-instance", {
          detail: { id: next.id, name: next.label },
        })
      );
      triggerRefresh();
    } else {
      sessionStorage.removeItem("selectedInstance");
      clearGraphs();
    }
  };

  return { instances, selectedInstanceId, handleInstanceChange };
};
