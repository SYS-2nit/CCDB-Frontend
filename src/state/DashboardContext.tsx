/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type GraphDataResponse,
  saveMemberWidgets,
  type MemberWidgetConfig,
} from "@/api/Dashboard/dashboard";

export type DashboardMode = "LIVE" | "10분" | "1시간" | "1일";

export interface InstanceOption {
  id: number;
  label: string;
  sid?: string | null;
}

interface DashboardContextValue {
  dbId: number | null;
  dbName: string | null;
  setDbInfo: (info: { id: number | null; name: string | null }) => void;
  instances: InstanceOption[];
  setInstances: (items: InstanceOption[]) => void;
  selectedInstanceId: number | null;
  selectedInstanceName: string | null;
  selectInstance: (item: InstanceOption | null) => void;
  mode: DashboardMode;
  rangeMinutes: number | null;
  setMode: (mode: DashboardMode, minutes: number | null) => void;
  graphList: GraphDataResponse[];
  graphsByName: Record<string, GraphDataResponse>;
  setGraphs: (
    graphs:
      | GraphDataResponse[]
      | ((prev: GraphDataResponse[]) => GraphDataResponse[])
  ) => void;
  reorderGraphsByNames: (names: string[]) => void;
  replaceGraphAt: (index: number, graph: GraphDataResponse) => void;
  clearGraphs: () => void;
  isWidgetOrderDirty: boolean;
  saveWidgetOrder: () => Promise<void>;
  isFetching: boolean;
  setIsFetching: (value: boolean) => void;
  error: string | null;
  setError: (value: string | null) => void;
  refreshToken: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

const INITIAL_STATE: DashboardContextValue = {
  dbId: null,
  dbName: null,
  setDbInfo: () => {},
  instances: [],
  setInstances: () => {},
  selectedInstanceId: null,
  selectedInstanceName: null,
  selectInstance: () => {},
  mode: "LIVE",
  rangeMinutes: null,
  setMode: () => {},
  graphList: [],
  graphsByName: {},
  setGraphs: () => {},
  reorderGraphsByNames: () => {},
  replaceGraphAt: () => {},
  clearGraphs: () => {},
  isWidgetOrderDirty: false,
  saveWidgetOrder: async () => {},
  isFetching: false,
  setIsFetching: () => {},
  error: null,
  setError: () => {},
  refreshToken: 0,
  triggerRefresh: () => {},
};

const buildGraphMap = (graphs: GraphDataResponse[]) => {
  const map: Record<string, GraphDataResponse> = {};
  graphs.forEach((graph) => {
    if (graph?.name) {
      map[graph.name] = graph;
    }
  });
  return map;
};

const mapNamesToGraphs = (
  names: string[],
  graphList: GraphDataResponse[]
): GraphDataResponse[] => {
  const map = new Map(graphList.map((graph) => [graph.name, graph] as const));
  const next = names
    .map((name) => map.get(name))
    .filter((graph): graph is GraphDataResponse => Boolean(graph));
  const leftovers = graphList.filter((graph) => !next.includes(graph));
  return [...next, ...leftovers];
};

const getWidgetPayload = (graphs: GraphDataResponse[]): MemberWidgetConfig[] =>
  graphs
    .map((graph, index) => ({ graphId: graph.id, position: index + 1 }))
    .filter((item) => item.graphId != null);

export const DashboardProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [dbId, setDbId] = useState<number | null>(null);
  const [dbName, setDbName] = useState<string | null>(null);
  const [instances, setInstancesState] = useState<InstanceOption[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    null
  );
  const [selectedInstanceName, setSelectedInstanceName] = useState<
    string | null
  >(null);
  const [mode, setModeState] = useState<DashboardMode>("LIVE");
  const [rangeMinutes, setRangeMinutes] = useState<number | null>(null);
  const [graphList, setGraphList] = useState<GraphDataResponse[]>([]);
  const [isWidgetOrderDirty, setIsWidgetOrderDirty] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const latestGraphOrderRef = useRef<MemberWidgetConfig[] | null>(null);

  const setDbInfo = useCallback(
    ({ id, name }: { id: number | null; name: string | null }) => {
      setDbId(id);
      setDbName(name);
    },
    []
  );

  const setInstances = useCallback((items: InstanceOption[]) => {
    setInstancesState(items);
  }, []);

  const selectInstance = useCallback((item: InstanceOption | null) => {
    if (item) {
      setSelectedInstanceId(item.id);
      setSelectedInstanceName(item.label);
    } else {
      setSelectedInstanceId(null);
      setSelectedInstanceName(null);
    }
  }, []);

  const setMode = useCallback(
    (nextMode: DashboardMode, minutes: number | null) => {
      setModeState(nextMode);
      setRangeMinutes(minutes);
    },
    []
  );

  const setGraphs = useCallback(
    (
      graphs:
        | GraphDataResponse[]
        | ((prev: GraphDataResponse[]) => GraphDataResponse[])
    ) => {
      setGraphList((prev) => {
        const nextGraphs = typeof graphs === "function" ? graphs(prev) : graphs;

        if (!nextGraphs || nextGraphs.length === 0) {
          return [];
        }

        if (prev.length === 0) {
          return nextGraphs;
        }

        const map = new Map(
          nextGraphs.map((graph) => [graph.id, graph] as const)
        );
        const ordered = prev
          .map((graph) => map.get(graph.id))
          .filter((graph): graph is GraphDataResponse => Boolean(graph));

        const remaining = nextGraphs.filter(
          (graph) => !ordered.some((item) => item.id === graph.id)
        );
        const nextList = [...ordered, ...remaining];

        if (nextList.length === nextGraphs.length) {
          return nextList;
        }

        return nextGraphs;
      });
    },
    []
  );

  const reorderGraphsByNames = useCallback((names: string[]) => {
    setGraphList((prev) => {
      if (!prev.length) return prev;
      const next = mapNamesToGraphs(names, prev);
      setIsWidgetOrderDirty(true);
      return next;
    });
  }, []);

  const replaceGraphAt = useCallback(
    (index: number, graph: GraphDataResponse) => {
      setGraphList((prev) => {
        const next = [...prev];
        if (index >= 0 && index < next.length) {
          next[index] = graph;
        } else {
          next[index] = graph;
        }
        setIsWidgetOrderDirty(true);
        return next;
      });
    },
    []
  );

  const clearGraphs = useCallback(() => {
    setGraphList([]);
    setIsWidgetOrderDirty(false);
    latestGraphOrderRef.current = null;
  }, []);

  const saveWidgetOrder = useCallback(async () => {
    if (!graphList.length) return;
    const payload = getWidgetPayload(graphList);
    if (payload.length === 0) return;

    const serialized = JSON.stringify(payload);
    if (
      latestGraphOrderRef.current &&
      JSON.stringify(latestGraphOrderRef.current) === serialized
    ) {
      setIsWidgetOrderDirty(false);
      return;
    }

    try {
      await saveMemberWidgets({ widgets: payload });
      latestGraphOrderRef.current = payload;
      setIsWidgetOrderDirty(false);
    } catch (err) {
      console.warn("[DashboardContext] 위젯 순서를 저장하는 중 오류", err);
    }
  }, [graphList]);

  const triggerRefresh = useCallback(() => {
    setRefreshToken(Date.now());
  }, []);

  useEffect(() => {
    return () => {
      if (isWidgetOrderDirty) {
        void saveWidgetOrder();
      }
    };
  }, [isWidgetOrderDirty, saveWidgetOrder]);

  const graphsByName = useMemo(() => buildGraphMap(graphList), [graphList]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      dbId,
      dbName,
      setDbInfo,
      instances,
      setInstances,
      selectedInstanceId,
      selectedInstanceName,
      selectInstance,
      mode,
      rangeMinutes,
      setMode,
      graphList,
      graphsByName,
      setGraphs,
      reorderGraphsByNames,
      replaceGraphAt,
      clearGraphs,
      isWidgetOrderDirty,
      saveWidgetOrder,
      isFetching,
      setIsFetching,
      error,
      setError,
      refreshToken,
      triggerRefresh,
    }),
    [
      dbId,
      dbName,
      setDbInfo,
      instances,
      setInstances,
      selectedInstanceId,
      selectedInstanceName,
      selectInstance,
      mode,
      rangeMinutes,
      setMode,
      graphList,
      graphsByName,
      setGraphs,
      reorderGraphsByNames,
      replaceGraphAt,
      clearGraphs,
      isWidgetOrderDirty,
      saveWidgetOrder,
      isFetching,
      error,
      refreshToken,
      triggerRefresh,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    return INITIAL_STATE;
  }
  return context;
};